import { createSlice } from "@reduxjs/toolkit";
import {
  CONVERSATION_STATUS,
  defaultDomain,
  MESSAGE_TYPE,
  SOCKET_EVENT_NAME,
  UPLOAD_STATUS,
  USERTYPE,
} from "@constants";
import {
  convertToAttachmentEntity,
  findConversationIndex,
  findMessageIndex,
  generate_message,
  generate_temp_conversation,
} from "../../helpers/utilityFunctions";
import {
  getCookie,
  getConversationsHelper,
} from "../../helpers/sparkyConversationState";
import { enableMapSet } from "immer";
import { Dispatch } from "react";
import { Messages } from "../../constants/Message";
import { AppDispatch, RootState } from "@store";
import { set_user_info, user_info } from "./userInfoSlice";

enableMapSet();
const STATE_KEY = "conversations";
export const ConversationSlice = createSlice({
  name: STATE_KEY,
  initialState: {
    value: [],
    temp_conversations: new Map(),
    conversations: new Map(),
    online_presence_info: new Map(),
    conversation_typing_status: {},
    temp_messages: new Map(),
    isLoading: true,
    promptLoading: false,
    hasFetchedOnce: false,
    selected_conversation_id: null,
    fetching_more_conversations: false,
    play_notification: false,
    open_conversations: [],
    last_conversation_response: null,
    typing_status_timeout: {},
    typing_status: {},
    upload_queue: [],
    upload_state: {
      progress: 0.0,
      uploading: false,
      cancel_upload: false,
      file_id: null,
    },
  },
  reducers: {
    addNewConversation: (state: any, action) => {
      if (!action.payload) {
        console.log("addConversationError", action.payload);
        return;
      }

      state.value.push(action.payload);
    },
    add_new_conversation: (state, action) => {
      const { conversation, message } = action.payload;
      if (conversation && message) {
        state.conversations.set(conversation._id, {
          ...conversation,
          messages: new Map([[message._id, { ...message, status: "default" }]]),
          typing: null,
          sending_message: false,
          fetching_messages: false,
          fetched_messages: true,
          scroll: false,
          attachments: [],
          attachments_uploaded: true,
        });
      }
    },

    add_temp_message: (state, action) => {
      const { conversation_id, msg } = action.payload;
      if (conversation_id && msg) {
        const con = state.temp_conversations.get(conversation_id);
        con.messages.set(msg._id, msg);
        state.temp_conversations.set(conversation_id, con);
      }
    },
    add_more_messages: (state, action) => {
      const { conversation_id, messages, response } = action.payload;

      if (conversation_id && messages) {
        const con = state.conversations.get(conversation_id);
        if (!con.messages) {
          con.messages = new Map();
        }
        const messages_array = Array.from(con.messages);
        const incoming_messages = new Map(
          messages.map(
            (message: any) =>
              [message._id, { ...message, status: "default" }] as const
          )
        );
        console.log("incoming messages", incoming_messages);

        console.log("messages_array before", messages_array);
        messages_array.unshift(...Array.from(incoming_messages));
        console.log("messages_array after", messages_array);
        //@ts-ignore
        console.log("messages map", new Map(messages_array));

        //@ts-ignore
        con.messages = new Map(messages_array);
        console.log("con.messages", con.messages);
        con.lastResponse = response;

        state.conversations.set(conversation_id, con);
      }
    },
    set_play_notification: (state, action) => {
      state.play_notification = action.payload;
    },
    set_prompt_loading: (state, action) => {
      state.promptLoading = action.payload;
    },
    add_message: (state, action) => {
      const { conversation_id, msg, conversation } = action.payload;
      if (conversation_id && msg) {
        const con = state.conversations.get(conversation_id);
        con.messages.set(msg._id, msg);
        state.conversations.set(conversation_id, con);
        con.scroll = true;
        state.conversations.set(conversation_id, con);
      }

      if (conversation) {
        const con = state.conversations.get(conversation_id);
        con.assigned_to = conversation.assigned_to;
        state.conversations.set(conversation_id, con);
      }
    },
    set_scroll: (state, action) => {
      const { scroll, conversation_id } = action.payload;
      if (conversation_id && scroll != undefined) {
        const con = state.conversations.get(conversation_id);
        con.scroll = scroll;
        state.conversations.set(conversation_id, con);
      }
    },
    add_messages: (state, action) => {
      const { conversation_id, messages, response } = action.payload;
      if (conversation_id && messages) {
        const con = state.conversations.get(conversation_id);
        con.lastResponse = response;

        const incoming_messages = new Map(
          messages.map(
            (message: any) =>
              [message._id, { ...message, status: "default" }] as const
          )
        );

        con.messages = incoming_messages;

        state.conversations.set(conversation_id, con);
      }
      set_scroll({ scroll: true, conversation_id });
    },
    update_sent_message: (state, action) => {
      const { old_id, msg, conversation_id } = action.payload;
      //  console.log('payload', action.payload)
      if (old_id && msg && conversation_id) {
        if (state.conversations.has(conversation_id)) {
          const con = state.conversations.get(conversation_id);
          con.last_message = msg;
          con.messages.set(msg._id, { ...msg, status: "default" });
          con.messages.delete(old_id);
          state.conversations.set(conversation_id, con);
        }
      }
    },
    queueUpload: (state: any, action: any) => {
      if (action.payload) {
        state.upload_queue.push(action.payload);
      }
    },
    cancelCurrentAttachmentsUpload: (state) => {
      state.upload_state.cancel_upload = true;
    },
    dequeueUpload: (state) => {
      state.upload_queue.shift();
    },

    updateFileAttachmentState: (state, action) => {
      const { file_id, status, url } = action.payload;
      const con = state.conversations.get(file_id.split("-")[0]);
      const index = con.attachments.findIndex(
        (item: any) => item.file.id === file_id
      );
      if (index != undefined && index != null) {
        con.attachments[index].status = status;
        con.attachments[index].url = url;
        con.attachments = [...con.attachments];
        state.conversations.set(file_id.split("-")[0], con);
      }
    },
    removeAttachment: (state, action) => {
      const { conversationId, index } = action.payload;
      if (conversationId && index != undefined) {
        const con = state.conversations.get(conversationId);
        const temp = [...con.attachments];
        const temp_attachment = temp[index];
        state.upload_queue = state.upload_queue.filter(
          (attachment: any) => attachment.id != temp_attachment.file.id
        );
        temp.splice(index, 1);
        con.attachments = temp;
        state.conversations.set(conversationId, con);
      }
    },
    clearAttachments: (state, action) => {
      const { conversationId } = action.payload;
      if (conversationId) {
        const con = state.conversations.get(conversationId);
        con.attachments = [];
        state.conversations.set(conversationId, con);
      }
    },
    updateUploadState: (state, action) => {
      const {
        progress,
        uploading,
        cancel_upload = false,
        file_id,
      } = action.payload;
      state.upload_state = { progress, uploading, cancel_upload, file_id };
    },
    updateUploadProgress: (state, action) => {
      const { progress, file_id } = action.payload;
      state.upload_state.progress = progress;
      state.upload_state.file_id = file_id;
    },
    add_attachments: (state: any, action) => {
      const { files, conversationId } = action.payload;
      console.log("adding attachments", files);
      if (files && files?.length) {
        console.log("files attachments", files);
        const con = state.conversations.get(conversationId);
        const final = [];
        for (let i = 0; i < files.length; i++) {
          console.log("current file", files[i]);
          final.push({
            file: files[i],
            status: UPLOAD_STATUS.WAITING,
            url: null,
          });
        }

        console.log("final file attachments", final);
        console.log("final files", files);

        con.attachments_uploaded = false;
        con.attachments = [...final, ...con.attachments];
        state.conversations.set(conversationId, con);
      }
    },
    add_to_upload_queue: (state: any, action) => {
      const { files } = action.payload;
      if (files.length) {
        // const con = state.cons.get(conversationId);
        // const temp_queue = copy_instance(con.upload_queue)
        // console.log('temp queue',temp_queue)
        for (let i = 0; i < files.length; i++) {
          state.upload_queue.add(files[i]);
        }
        // con.upload_queue = temp_queue;
        // state.cons.set(conversationId, con);
      }
    },
    updateMessage: (state: any, action) => {
      // TODO:update with hashmap for constant time complexity
      if (!action.payload) {
        console.log("Empty payload", action.payload);
      }
      let message = action.payload;
      if (message.isPrompt) {
        message.prompt.submitted = true;
      }

      message = { ...message, status: "default" };

      const conversationIndex = findConversationIndex(
        state,
        message.conversationId
      );
      const messageIndex = findMessageIndex(
        state,
        conversationIndex,
        message._id
      );
      state.value[conversationIndex].messages[messageIndex] = message;
    },
    updatePromptAsMesssage: (state: any, action) => {
      let message = action.payload.msg;
      if (action.payload.sending) {
        message = { ...action.payload.msg, status: "sending" };
        console.log("updatePrompt sending message ", message);
      } else {
        message = { ...action.payload.msg, status: "default" };
      }
      const conversationIndex = findConversationIndex(
        state,
        message.conversationId
      );
      const messageIndex = findMessageIndex(
        state,
        conversationIndex,
        message._id
      );
      console.log("found conversationIndex: ", conversationIndex);

      console.log("found messageIndex: ", messageIndex);
      state.value[conversationIndex].messages[messageIndex] = message;
    },
    get_more_conversations_successful: (state: any, action) => {
      const { conversations } = action.payload;
      const array_conversation = Array.from(state.conversations);
      const incoming_conversation = new Map(
        conversations.map((con: any) => [con._id, con] as const)
      );
      array_conversation.push(...Array.from(incoming_conversation));
      //@ts-ignore
      state.conversations = new Map(array_conversation);
      state.last_conversation_response = action.payload;
    },
    start_get_conversations: (state: any, action) => {
      state.isLoading = true;
    },
    set_selected_conversation_id: (state, action) => {
      state.selected_conversation_id = action.payload;
    },
    set_temp_conversation: (state, action) => {
      const temp_conversation = action.payload;
      console.log("temp_conversation: ", temp_conversation);

      state.temp_conversations.set(temp_conversation._id, {
        _id: temp_conversation._id,
        created_by: null,
        messages: new Map(),
        typing: null,
      });
    },
    set_fetching_more_messages: (state: any, action) => {
      const { conversation_id, is_fetching } = action.payload;
      if (conversation_id && is_fetching != undefined) {
        const con = state.conversations.get(conversation_id);
        con.fetching_more_messages = is_fetching;
        state.conversations.set(conversation_id, con);
      }
    },
    set_is_sending_message: (state, action) => {
      const { conversation_id, is_sending } = action.payload;
      if (conversation_id && is_sending) {
        if (state.conversations.has(conversation_id)) {
          const con = state.conversations.get(conversation_id);
          con.sending_message = is_sending;
          state.conversations.set(conversation_id, con);
        }
      }
    },
    set_fetched_messages: (state, action) => {
      const { conversation_id, fetched } = action.payload;
      if (conversation_id && fetched) {
        if (state.conversations.has(conversation_id)) {
          const con = state.conversations.get(conversation_id);
          con.fetched_messages = fetched;
          state.conversations.set(conversation_id, con);
        }
      }
    },
    set_fetching_messages: (state, action) => {
      const { conversation_id, is_fetching } = action.payload;
      if (conversation_id && is_fetching != undefined) {
        const con = state.conversations.get(conversation_id);
        con.fetching_messages = is_fetching;
        state.conversations.set(conversation_id, con);
      }
    },
    set_read_receipts: (state, action) => {
      if (action.payload) {
        const { conversation_id, messages } = action.payload;
        const conversation = state.conversations.get(conversation_id);
        const current_messages = conversation.messages;
        messages.forEach((message: any) => {
          const updated_msg = { ...message, seen: true };
          current_messages.set(message._id, updated_msg);
        });
        conversation.messages = current_messages;
        state.conversations.set(conversation_id, conversation);
      }
    },

    set_create_conversation: (state, action) => {
      const { conversation, message } = action.payload;

      if (conversation && message)
        state.conversations.set(conversation.id, {
          id: conversation.id,
          ...conversation,
          messages: new Map([[message.id, message]]),
          typing: null,
        });
    },
    set_typing_status: (state: any, action) => {
      if (action.payload) {
        const { conversation_id, status } = action.payload;
        state.typing_status[conversation_id] = { status };
      }
    },
    set_last_response: (state: any, action: any) => {
      state.last_conversation_response = action.payload;
    },
    set_typing_status_timeout: (state: any, action) => {
      if (action.payload) {
        const { conversation_id, timeout } = action.payload;
        state.typing_status_timeout[conversation_id] = timeout;
      }
    },
    update_typing_status: (state: any, action) => {
      if (action.payload != null || action.payload != undefined) {
        const { conversation_id, user_id } = action.payload;
        state.conversation_typing_status[conversation_id] = {
          [user_id]: action.payload,
        };
        action.payload;
      }
    },
    set_fetching_more_conversations: (state, action) => {
      state.fetching_more_conversations = action.payload;
    },
    get_conversations_successful: (state, action) => {
      state.isLoading = false;
      state.hasFetchedOnce = true;
      //TODO:process conversations here

      action.payload.forEach((con: any) => {
        state.conversations.set(con._id, {
          ...con,
          allow_input: true,
          messages: new Map(),
          fetching_messages: false,
          fetched_messages: false,
          fetching_more_messages: false,
          lastResponse: null,
          sending_message: false,
          typing: null,
          scroll: false,
          attachments: [],
          attachments_uploaded: true,
        });
      });
    },
    getMessagesLoading: (state: any, action) => {
      state.value[action.payload].fetchingMessages = true;
    },
    getMessagesSuccessful: (state: any, action) => {
      // state.value[action.payload].fetchingMessages = false
      console.log("get Message Succesfull", action.payload.messages.length);

      console.log("payload has messages", action.payload.messages.length);

      const index = state.value.findIndex((item: any) => {
        console.log("payload: ", action.payload.conversationId);
        if (item._id === action.payload.conversationId) {
          return true;
        } else {
          return false;
        }
      });
      console.log("found index", index);

      if (index != -1) {
        console.log("found conversation index.");
        // found conversation index
        state.value[index].fetchingMessages = false;
        state.value[index].fetchedMessages = true;
        console.log("conversation index.", index);
        state.value[index].messages = action.payload.messages;
      }
    },
  },
});

export const {
  update_typing_status,
  getMessagesSuccessful,
  getMessagesLoading,
  set_create_conversation,
  get_conversations_successful,
  start_get_conversations,
  set_temp_conversation,
  add_temp_message,
  add_message,
  set_prompt_loading,
  cancelCurrentAttachmentsUpload,
  queueUpload,
  dequeueUpload,
  removeAttachment,
  addNewConversation,
  set_last_response,
  set_read_receipts,
  updateMessage,
  clearAttachments,
  set_selected_conversation_id,
  add_new_conversation,
  set_is_sending_message,
  add_more_messages,
  set_scroll,
  set_play_notification,
  set_fetching_more_messages,
  set_fetching_more_conversations,
  get_more_conversations_successful,
  set_fetched_messages,
  set_fetching_messages,
  update_sent_message,
  add_messages,
  add_attachments,
  updatePromptAsMesssage,
  updateFileAttachmentState,
  updateUploadProgress,
  updateUploadState,
  set_typing_status,
  set_typing_status_timeout,
} = ConversationSlice.actions;

export const send_message = (conversation_id: string, msg: any) => {
  return async (dispatch: any, get_state: any) => {
    const conversations = get_state().conversations;
    dispatch(
      set_is_sending_message({
        conversation_id,
        is_sending: true,
      })
    );
    const attachments =
      conversations.conversations.get(conversation_id).attachments;
    console.log("current con attachments", attachments);

    const current_con = conversations.conversations.get(conversation_id);
    console.log("current con attachments", current_con);

    const final_attachments = attachments.map((attachment: any) =>
      convertToAttachmentEntity(attachment)
    );
    console.log("final_attachments", final_attachments);

    dispatch(
      add_message({
        conversation_id,
        msg: { ...msg, attachments: final_attachments },
      })
    );
    //send socket message here
    dispatch(clearAttachments({ conversationId: conversation_id }));
    const socket = get_state().auth.socket;

    socket.emit(
      "new_message",
      {
        event_name: "new_message",
        data: {
          conversation_id,
          text: msg.content.text,
          attachments: final_attachments,
          msg,
        },
      },
      (response: any) => {
        // console.log('message response:', response);
        // console.log(`message_id to replace ${msg._id} with ${response.data._id}`)
        dispatch(
          update_sent_message({
            old_id: msg._id,
            msg: response.data,
            conversation_id,
          })
        );
      }
    );
  };
};

export const sendPromptResponse = (email: string, msg: any) => {
  return async (dispatch: any, get_state: any) => {
    //send socket message here
    const socket = get_state().auth.socket;

    console.log('state:', get_state());

    dispatch(set_prompt_loading(true));

    socket.emit(SOCKET_EVENT_NAME.UPDATE_USER_EMAIL, {
      event_name: SOCKET_EVENT_NAME.UPDATE_USER_EMAIL,
      data: {
        id: msg.sender._id,
        conversation_id: msg.conversation._id,
        message_id: msg._id,
        workspace_id: msg.conversation.workspace,
        user: {
          email,
        },
      }
    }, (resp: any) => {
      console.log('new user data:', resp);
      dispatch(set_prompt_loading(false))

      // TODO: also add the updating of user info here
      dispatch(add_message({
        msg: resp?.data?.message,
        conversation_id: resp?.data?.message?.conversation?._id,
        conversation: resp?.data?.message?.conversation,
      }));

      dispatch(set_user_info(resp?.data?.user));
    });
  };
};

export const get_conversations = () => {
  return async (dispatch: any, getState: any) => {
    const socket = getState().auth.socket;
    socket.emit(
      "get_conversations",
      {
        event_name: "get_conversations",
        data: {
          page: 1,
          size: 10,
          status: CONVERSATION_STATUS.OPEN,
          sort: -1,
          contactId: null,
        },
      },
      (response: any) => {
        if (response.error) {
        } else {
          dispatch(get_conversations_successful(response.data.conversations));
          dispatch(set_last_response(response.data));
        }
      }
    );
  };
};

export const getMessages: any = (id: string, index: any) => {
  return async (dispatch: any, get_state: any) => {
    dispatch(getMessagesLoading(index));
    // console.log('conversations id:', id);
    const socket = get_state().auth.socket;
    socket.emit("getMessages", id);
  };
};

export const create_conversation = (payload: any) => {
  //   // console.log('create_conversation dispatched payload:', payload);
  // return async (dispatch:any, getState:any) => {
  //   const state = getState();
  //   let socket = state.auth.socket;
  //   dispatch(add_temp_message({ conversation_id: con._id, msg: temp_message }));
  //   // dispatch(set_temp_conversation({ temp_conversation, temp_message }));
  //   dispatch(
  //     set_is_sending_message({ conversation_id: con_id, is_sending: true })
  //   );
  //   //send socket message here
  //   socket.emit(
  //     "create_conversation",
  //     { event_name: "create_conversation", data: { text, payload: {} } },
  //     (response:any ) => {
  //       dispatch(
  //         set_is_sending_message({
  //           conversation_id: con._id,
  //           is_sending: false,
  //         })
  //       );
  //       // console.log('create_conversation result:', response);
  //       // console.log('temp conversation id: ', con._id);
  //       // console.log('temp message id: ', temp_message._id);
  //     }
  //   );
  // };
};

export const recieveNewMessage = (msg: any) => {
  return async (dispatch: any, getState: any) => {
    const conversations = getState().conversations.value;
    // console.log('conversation Array: ', conversations);
    // console.log('received message: ', msg);
    dispatch(add_message({ sending: false, msg }));
  };
};

export const set_typing = (payload: any) => (dispatch: any, get_state: any) => {
  dispatch(set_typing_status(payload));
  const socket = get_state().auth.socket;
  socket.emit(
    "set_typing_status",
    { event_name: "set_typing_status", data: payload },
    (response: any) => {
      console.log("response", response);
    }
  );
};
export const get_more_conversations = () => {
  return async (dispatch: any, getState: any) => {
    const socket = getState().auth.socket;
    const user = getState().user_info.user;
    const lastConversationResponse =
      getState().conversations.last_conversation_response;

    dispatch(set_fetching_more_conversations(true));

    socket.emit(
      "get_conversations",
      {
        event_name: "get_conversations",
        data: {
          page: lastConversationResponse?.page
            ? lastConversationResponse.page + 1
            : 1,
          size: 10,
          status: CONVERSATION_STATUS.OPEN,
          sort: -1,
          contactId: user._id,
        },
      },
      (response: any) => {
        if (response.error) {
          // error fetching conversations
          dispatch(set_fetching_more_conversations(false));
        } else {
          dispatch(get_more_conversations_successful(response.data));
          dispatch(set_fetching_more_conversations(false));
        }
      }
    );
  };
};
export const get_messages = (conversation_id: string) => {
  return async (dispatch: any, getState: any) => {
    const socket = getState().auth.socket;

    dispatch(set_fetching_messages({ conversation_id, is_fetching: true }));
    socket.emit(
      "get_messages",
      {
        event_name: "get_messages",
        data: { conversation_id, page: 1, sort: -1 },
      },
      (response: any) => {
        console.log("got messages:", response);
        dispatch(
          add_messages({ conversation_id, messages: response.data, response })
        );
        dispatch(
          set_fetching_messages({ conversation_id, is_fetching: false })
        );
        dispatch(set_fetched_messages({ conversation_id, fetched: true }));
      }
    );
  };
};
export const get_more_messages = (conversation_id: string, page: number) => {
  return async (dispatch: any, getState: any) => {
    const socket = getState().auth.socket;
    const conversations = getState().conversations.conversations;

    if (conversations.get(conversation_id).fetching_more_messages) {
      return;
    }

    dispatch(
      set_fetching_more_messages({ conversation_id, is_fetching: true })
    );

    socket.emit(
      "get_messages",
      {
        event_name: "get_messages",
        data: { conversation_id, page, size: 10, sort: -1 },
      },
      (response: any) => {
        console.log("got more messages", response);

        dispatch(
          add_more_messages({
            conversation_id,
            messages: response.data,
            response,
          })
        );
        dispatch(
          set_fetching_more_messages({ conversation_id, is_fetching: false })
        );
      }
    );
  };
};

export const send_read_receipts = (conversation_id: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const socket = getState().auth.socket;
    const user_id = getState().auth.user_id;
    const messages = Array.from(
      getState()
        .conversations.conversations.get(conversation_id)
        ?.messages.values() || []
    ).filter((msg: any) => {
      if (msg.sender._id !== user_id && !msg.seen) {
        return true;
      }
    });

    if (messages.length) {
      //@ts-ignore
      socket.emit(
        "read_receipts",
        {
          event_name: "read_receipts",
          data: { messages },
        },
        (response: any) => {
          if (response.data) {
            dispatch(set_read_receipts(response.data));
          }
        }
      );
    }
  };
};

export const conversation_slice_selector = (state: any) => state[STATE_KEY];
export default ConversationSlice.reducer;
