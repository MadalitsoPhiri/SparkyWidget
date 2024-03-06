import { MESSAGE_TYPE, UPLOAD_STATUS, USERTYPE } from "@constants";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Messages } from "../constants/Message";
import { AVAILABILITY } from "../constants/availability";
import {
  formatBytes,
  generateRandomID,
  generate_message,
  generate_temp_conversation,
  getInitialsFromName,
} from "../helpers/utilityFunctions";
import { auth_selector, get_user_info } from "../store/slices/auth_slice";
import {
  add_attachments,
  add_new_conversation,
  cancelCurrentAttachmentsUpload,
  conversation_slice_selector,
  get_messages,
  get_more_messages,
  queueUpload,
  removeAttachment,
  send_message,
  send_read_receipts,
  set_typing,
  set_typing_status_timeout,
} from "../store/slices/conversations_slice";
import { user_info_selector } from "../store/slices/userInfoSlice";
import { Loader } from "./Loader";
import Message from "./Message";
import TypingStatus from "./TypingStatus";

export default function ChatArea() {
  let navigate = useNavigate();
  let location = useLocation();
  let { conversation_id, index } = useParams();
  const bottomRef = useRef(null);
  const messageInputRef = useRef(null);
  const firstMessageRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef(null);
  const dispatch = useDispatch();
  const {
    conversation_typing_status,
    conversations,
    upload_state,
    typing_status,
    typing_status_timeout,
  } = useSelector(conversation_slice_selector);
  const { socket, users_info } = useSelector(auth_selector);
  const config = useSelector((state: any) => state.config.value);
  const { user } = useSelector(user_info_selector);
  const [messageInput, setMessageInput] = useState("");
  const [conversationId, set_conversationId] = useState<string | null>(null);
  const [uploadsComplete, setUploadsComplete] = useState(true);
  const [sendButtonVisible, setSendButtonVisible] = useState(false);
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const [current_conversation, set_current_conversation] = useState<any>(null);
  const ConversationsRef = useRef(conversations);
  const observerRef: React.MutableRefObject<IntersectionObserver | null> =
    useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // useEffect(() => {
  //   console.log("auto scroll");
  //   console.log("current_conversation", current_conversation);

  //   if (current_conversation?.scroll) {
  //     console.log("current_conversation", current_conversation);

  //     scrollToBottom();
  //     dispatch(set_scroll({ scroll: false, conversation_id }));
  //   }
  // }, [current_conversation, conversation_typing_status]);
  useEffect(() => {
    // dispatch(set_scroll({ scroll: true, conversation_id }));
    scrollToBottom();
  }, [current_conversation]);
  useEffect(() => {
    try {
      conversations
        .get(conversation_id)
        ?.attachments.forEach((attachment: any) => {
          if (
            attachment.status != UPLOAD_STATUS.COMPLETED ||
            attachment.url === ""
          ) {
            throw new Error("uploads incomplete");
          } else {
            if (!uploadsComplete) {
              setUploadsComplete(true);
            }
          }
        });
    } catch (e) {
      console.log("upload error", e);
      if (uploadsComplete) {
        setUploadsComplete(false);
      }
    }
  }, [messageInput, conversations, upload_state.uploading]);
  useEffect(() => {
    set_conversationId(conversation_id as string);

    return () => {
      clearTimeout(typing_status_timeout);
    };
  }, []);

  useEffect(() => {
    if (conversationId) {
      const result = conversations.get(conversationId);

      if (result) {
        set_current_conversation(result);
      }
    }
    if (!current_conversation) {
      const current_conversation = generate_temp_conversation(user);
      // console.log("current_converstion", current_conversation);
      set_current_conversation(current_conversation);
    }
  }, [conversationId, conversations]);

  const handleBack = () => {
    navigate(-1);
  };
  const timeoutFunction = () => {
    dispatch(
      set_typing({
        status: false,
        conversation_id: conversationId,
      }) as any
    );
  };
  const handleSendSwitchOverMessage = () => {
    const temp_message = generate_message(
      user,
      {
        content: { text: "speak to an agent", payload: {} },
        type: MESSAGE_TYPE.SWITCH_TO_AGENT,
      } as Messages,
      current_conversation
    );
    if (conversationId) {
      dispatch(send_message(conversationId, temp_message) as any);
    }
  };
  const handleSendMessage = (e: any) => {
    if (
      (!upload_state.uploading && e.code === "Enter") ||
      e.target.id === "sendButton"
    ) {
      const attachments = conversations.get(conversation_id)?.attachments;

      if (messageInput != "" || attachments?.length) {
        if (conversationId) {
          const temp_message = generate_message(
            user,
            { content: { text: messageInput, payload: {} } } as Messages,
            current_conversation
          );
          dispatch(send_message(conversationId, temp_message) as any);
          setMessageInput("");
        } else {
          const temp_message = generate_message(
            user,
            { content: { text: messageInput, payload: {} } } as Messages,
            current_conversation
          );
          setMessageInput("");
          create_new_conversation(temp_message);
        }
      }
    } else {
      if (
        (!((conversationId as string) in typing_status) ||
          !typing_status[conversationId as string].status) &&
        conversationId
      ) {
        dispatch(
          set_typing({
            status: true,
            conversation_id: conversationId,
          }) as any
        );
        dispatch(
          set_typing_status_timeout({
            conversation_id: conversationId,
            timeout: setTimeout(timeoutFunction, 3000),
          })
        );
      } else {
        if (
          (conversationId as string) in typing_status_timeout &&
          conversationId
        ) {
          clearTimeout(typing_status_timeout[conversationId]);
          dispatch(
            set_typing_status_timeout({
              conversation_id: conversationId,
              timeout: setTimeout(timeoutFunction, 3000),
            })
          );
        }
      }
    }
  };
  const create_new_conversation = (initialMessage: Messages) => {
    const conversation = current_conversation
      ? current_conversation
      : generate_temp_conversation(user);
    set_current_conversation(conversation);

    initialMessage.conversation = conversation;

    const updated_conversation = { ...conversation };
    updated_conversation.messages.set(initialMessage._id, initialMessage);
    set_current_conversation(updated_conversation);
    socket?.emit(
      "create_conversation",
      {
        event_name: "create_conversation",
        data: { message: initialMessage },
      },
      (response: any) => {
        // dispatch create_conversation
        // set current screen to point to created_conversation
        if (response && response.data.conversation) {
          dispatch(add_new_conversation(response.data));
          set_conversationId(response.data.conversation._id);
        }
      }
    );
  };
  const handleSendMessagefromOptions = (e: any) => {
    const newMessage = generate_message(user, {
      content: { text: e.target.textContent, payload: {} },
      type: MESSAGE_TYPE.TEXT,
    } as Messages);
    create_new_conversation(newMessage);
  };

  function handleUpload(event: any) {
    const {
      target: { files },
    } = event;
    const conId = conversation_id || current_conversation?._id;
    if (files.length) {
      for (let i = 0; i < files.length; i++) {
        Object.defineProperty(files[i], "id", {
          writable: false,
          value: `${conId}-${files[i].name}-${generateRandomID()}`,
        });
        dispatch(queueUpload(files[i]));
      }
      dispatch(add_attachments({ files, conversationId: conId }));
      event.target.value = null;
      event.target.blur();
      if (messageInputRef.current) {
        (messageInputRef.current as any).focus();
      }
    }
  }
  const handleCancel = (attachment: any, index: number) => {
    if (attachment.file.id === upload_state?.file_id) {
      dispatch(cancelCurrentAttachmentsUpload());
    }
    dispatch(removeAttachment({ conversationId: conversation_id, index }));
  };

  const handleMessageInputChnage = (e: any) => {
    setMessageInput(e.target.value);
    if (e.target.value === "") {
      setSendButtonVisible(false);
    } else {
      setSendButtonVisible(true);
    }
  };
  const getMoreMessagesForCurrentConversation = useCallback(() => {
    if (
      ConversationsRef.current.get(conversation_id).lastResponse?.count >
        ConversationsRef.current.get(conversation_id).messages.size &&
      !ConversationsRef.current.get(conversation_id).fetching_more_messages
    ) {
      dispatch(
        get_more_messages(
          conversation_id as string,
          ConversationsRef.current.get(conversation_id).lastResponse.page + 1
        ) as any
      );
    }
  }, [ConversationsRef.current]);
  const handleToolbarExpansion = () => {};

  const scrollToBottom = () => {
    if (bottomRef.current) {
      (bottomRef.current as any).scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      (bottomRef.current as any).addEventListener("scroll", (e: any) => {});
    }
  };
  useEffect(() => {
    ConversationsRef.current = conversations;
  }, [conversations]);
  useEffect(() => {
    const onIntersection = ([entry]: any) => {
      if (
        entry.isIntersecting &&
        ConversationsRef.current.get(conversation_id).lastResponse?.count >
          ConversationsRef.current.get(conversation_id).messages.size &&
        !ConversationsRef.current.get(conversation_id).fetching_more_messages
      ) {
        // TODO make pagination work well enough
        // getMoreMessagesForCurrentConversation();
      }
    };
    observerRef.current = new IntersectionObserver(onIntersection, {
      root: null,
      threshold: 1,
    });
  }, []);
  useEffect(() => {
    if (firstMessageRef.current) {
      observerRef?.current?.observe(firstMessageRef.current);
    }
  }, [firstMessageRef, conversation_id, current_conversation]);
  useEffect(() => {
    if (current_conversation) {
      if (
        conversation_id &&
        !conversations.get(conversation_id).fetched_messages
      ) {
        dispatch(get_messages(conversation_id) as any);
      }
    }
    //@ts-ignore
    dispatch(send_read_receipts(conversation_id));
  }, [current_conversation]);
  useEffect(() => {
    if (location?.state) {
      if (location?.state?.isSurveyAnswer) {
        // start conversation with survey answer as first message
        const temp_message = generate_message(
          user,
          {
            content: {
              text: location?.state?.payload?.option?.title,
              payload: { ...location?.state?.payload },
            },
            type: MESSAGE_TYPE.SURVEY_ANSWER,
          } as Messages,
          current_conversation
        );
        create_new_conversation(temp_message);
      }
    }
  }, []);

  const numberSortFn = (a: any, b: any) => {
    if (new Date(a.createdAt) < new Date(b.createdAt)) {
      return -1;
    } else if (new Date(a.createdAt) === new Date(b.createdAt)) {
      return 0;
    } else {
      return 1;
    }
  };

  return (
    <div className="relative flex flex-col flex-1 w-full h-full bg-white overflow-y-hidden">
      <div className="flex-1 flex flex-col overflow-y-hidden">
        {/* toolbar */}
        <div
          className={`bg-headerBgColor py-[12px] px-[8px] flex flex-row flex-shrink-0`}
        >
          {/* back button */}
          <div
            onClick={handleBack}
            className="px-[12px] py-[24px] flex justify-center items-center cursor-pointer h-0 hover:bg-[#0000002d]  rounded-[8px]"
          >
            <svg
              className={`w-[28px] h-[28px] text-chevronColor`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>

          <div
            onClick={handleToolbarExpansion}
            className={`${
              !toolbarExpanded && "hover:bg-[#0000002d]"
            } rounded-[8px] px-[8px] cursor-pointer ml-[8px] `}
          >
            <AnimatePresence>
              {!toolbarExpanded ? (
                <motion.div className="flex flex-row items-center justify-center ">
                  <div className="relative flex flex-row py-[8px]  justify-center items-center">
                    <div className="w-[32px] h-[32px] flex flex-row justify-center items-center flex-shrink-0 ">
                      {current_conversation?.assigned_to?.length &&
                      current_conversation.assigned_to[0].type !==
                        USERTYPE.BOT &&
                      current_conversation?.assigned_to[0]
                        ?.profile_picture_url !== "" ? (
                        <div className="relative flex flex-row justify-center items-center rounded-full bg-[#6764B3] w-[32px] h-[32px] overflow-hidden  flex-shrink-0 ">
                          <p className="absolute text-xs text-white font-semibold">
                            {getInitialsFromName(
                              current_conversation.assigned_to[0]?.user_name
                            )}
                          </p>{" "}
                          {/*username goes here*/}
                          <img
                            className={`absolute z-0 ${
                              imgLoaded ? "block" : "hidden"
                            }`}
                            onError={() => setImgLoaded(false)}
                            onLoad={() => setImgLoaded(true)}
                            src={
                              current_conversation.assigned_to[0]
                                ?.profile_picture_url
                            }
                          />
                        </div>
                      ) : (
                        <div className="bg-white w-[32px] h-[32px] flex flex-row justify-center items-center flex-shrink-0  rounded-full">
                          <svg
                            className="w-[16px] h-[16px] text-black"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.div
                    className="ml-[10px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "tween" }}
                  >
                    <p
                      className={` text-chevronColor  text-[16px] leading-[24px] font-light`}
                    >
                      {config.workspace.company_name}
                    </p>
                    <div className="flex flex-row justify-start items-center">
                      <svg
                        className={`w-[16px] h-[16px] text-chevronColor mr-[4px]`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <p
                        className={`text-chevronColor text-[14px] leading-[20px] font-light`}
                      >
                        {config.availability.reply_time || AVAILABILITY.DYNAMIC}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  className="flex flex-col pb-[8px]"
                  initial={{ height: 0 }}
                  animate={{ height: "180px" }}
                  transition={{ type: "tween" }}
                  exit={{ height: 0 }}
                >
                  <p className="text-white  text-[20px] leading-[28px] font-light my-[8px]">
                    Sparky
                  </p>
                  <p className="text-[#ffffffc7] font-light text-[14px] leading-[20px] mb-[16px]">
                    Sparky helps you make personalized cannabis recommendations.
                  </p>
                  <div>
                    <motion.div
                      className="flex flex-row mb-[16px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: "tween", delay: 0.2 }}
                    >
                      <div className="mr-[16px] flex flex-row -space-x-10">
                        <div className="bg-red-500 h-[56px] w-[56px] rounded-full border-4  border-[#602E9E]"></div>
                        <div className="bg-green-500 h-[56px] w-[56px] rounded-[9999px] border-4  border-[#602E9E]"></div>
                        <img
                          src="https://scontent.flun1-1.fna.fbcdn.net/v/t1.6435-9/39500132_10155573310807401_2542865486727610368_n.jpg?_nc_cat=106&ccb=1-5&_nc_sid=09cbfe&_nc_eui2=AeEm7xlGIvoPy-vPuTYQQcwd1CQcxXR2lHTUJBzFdHaUdE13lgeOOMBVodwGBoY-GaNGLMD27Oh1fRcIQ_yyGOz6&_nc_ohc=4R2AYO8JjY4AX8kTjkO&_nc_ht=scontent.flun1-1.fna&oh=b5037090e4d50eb00979a37aff2600fa&oe=61718E5E"
                          className="bg-black  h-[56px] w-[56px] rounded-[9999px]  border-4  border-[#602E9E]"
                        />
                      </div>
                      <div>
                        <p className="text-[#ffffffc7] text-[14px] leading-[20px] font-light">
                          Our usual reply time
                        </p>
                        <div className="flex flex-row justify-start items-center">
                          <svg
                            className="w-[16px] h-[16px] text-white  mr-[8px]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          <p className="text-white text-[14px] leading-[20px] font-semibold">
                            {config.availability.reply_time ||
                              AVAILABILITY.DYNAMIC}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* chat messages */}
        {!current_conversation || current_conversation.fetching_messages ? (
          <Loader
            width={50}
            height={50}
            color={config.colors.header_bg_color}
          />
        ) : (
          <div
            ref={messageListRef}
            className="overflow-y-auto w-full flex-1 flex flex-col  "
          >
            {!current_conversation ||
            (current_conversation.messages.size < 1 && !conversationId) ? (
              <div className="flex flex-col items-end justify-end h-full px-[26px] py-[26px]">
                <div className="group rounded-[8px] p-[10px] bg-transparent  mb-[8px] ">
                  <p className="text-[#a7a5aa]  text-[14px] leading-[20px] text-right">
                    {config.greetings.chatAreaGreetingText}
                  </p>
                </div>

                {[
                  config.chat_suggestions.suggestion1,
                  config.chat_suggestions.suggestion2,
                  config.chat_suggestions.suggestion3,
                ]
                  .filter(suggestion => !!suggestion)
                  .map((suggestion) => {
                    return (
                      <div
                        onClick={handleSendMessagefromOptions}
                        className="group rounded-[8px] p-[10px] bg-mainHoverColor  mb-[8px] hover:bg-headerBgColor cursor-pointer"
                      >
                        <p
                          className={`text-chatOptionsTextColor group-hover:text-chevronColor  text-[14px] leading-[20px]`}
                        >
                          {suggestion}
                        </p>
                      </div>
                    )
                  })}
                <div ref={bottomRef} />
              </div>
            ) : (
              <div className="flex flex-col items-end  h-full overscroll-y-auto overflow-x-hidden px-[26px] py-[26px]">
                {current_conversation?.fetching_more_messages && (
                  <div className="w-full flex flex-row justify-center p-4 sticky top-0">
                    <Loader width={20} height={20} color={"#6652A9"} />
                  </div>
                )}
                {Array.from(current_conversation.messages.values())
                  .filter((message: any) => message.type !== MESSAGE_TYPE.INFO)
                  .sort(numberSortFn)

                  .map((item, index) => {
                    const isFirstBubble = index === 0;
                    return isFirstBubble ? (
                      <motion.div ref={firstMessageRef}>
                        <Message
                          handleSendSwitchOver={handleSendSwitchOverMessage}
                          msg={item}
                          key={index}
                          dataSet={current_conversation?.messages}
                          index={index}
                        />
                      </motion.div>
                    ) : (
                      <Message
                        handleSendSwitchOver={handleSendSwitchOverMessage}
                        msg={item}
                        key={index}
                        dataSet={current_conversation?.messages}
                        index={index}
                      />
                    );
                  })}
                {conversation_typing_status?.hasOwnProperty(
                  conversation_id
                ) && (
                  <div className=" w-full  flex flex-col">
                    {Object.entries(
                      conversation_typing_status[conversation_id as string]
                    ).map(([key, value]) => {
                      if ((value as any).status && users_info.has(key)) {
                        scrollToBottom();
                        return (
                          <TypingStatus data={users_info.get(key)} key={key} />
                        );
                      } else {
                        // get user info here
                        if (!users_info.has(key))
                          dispatch(get_user_info(key) as any);
                      }
                    })}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-row gap-5 overflow-x-auto  scrollbar-thin pr-3 pl-4 scrollbar-thumb-gray-200 scrollbar-thumb-rounded w-full items-center">
        {current_conversation?._id &&
          conversations
            .get(current_conversation._id)
            ?.attachments?.map((attachment: any, index: number) => (
              <div
                key={attachment.file.id}
                className="relative rounded-md shadow-l group ring-1 ring-gray-300 max-h-36 m-2 mb-4  p-2  max-w-xs flex flex-col  bg-white z-[9999]"
              >
                <svg
                  onClick={() => handleCancel(attachment, index)}
                  className={`absolute -right-2 -top-2 w-5 h-5 text-gray-500 cursor-pointer invisible group-hover:visible`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>

                <div className="w-full flex-1 flex flex-row items-center">
                  {attachment.file.type.includes("image") ? (
                    <img
                      src={URL.createObjectURL(attachment.file)}
                      className="w-20 h-20 rounded-lg"
                    />
                  ) : (
                    <div className="bg-indigo-500 rounded-lg flex flex-row justify-center items-center w-10 h-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="w-full truncate">
                    <p
                      className={`truncate ${
                        attachment.file.type.includes("image") ? "ml-2" : "ml-2"
                      }  text-sm text-gray-500`}
                    >
                      {attachment.file.name}
                    </p>
                    <p
                      className={`truncate ${
                        attachment.file.type.includes("image") ? "ml-2" : "ml-2"
                      }  text-sm text-gray-400`}
                    >
                      {formatBytes(attachment.file.size)}
                    </p>
                  </div>
                </div>

                {attachment.file.id === upload_state?.file_id &&
                  upload_state.uploading && (
                    <div className="mt-2 w-full h-[5px]  bg-sideBarColor rounded-lg overflow-hidden">
                      <div
                        style={{ width: `${upload_state.progress}%` }}
                        className={`justify-self-end   h-[5px] bg-yellow-500 rounded-lg transition-all`}
                      ></div>
                    </div>
                  )}
              </div>
            ))}
      </div>
      <AnimatePresence>
        {current_conversation?.lead?.is_blocked ? (
          <div className="text-red-500 p-5 font-medium text-center">
            <p>
              You are currently blocked from sending messages to{" "}
              {config.workspace.company_name}. Please contact{" "}
              {config.workspace.company_name} support for more information.
            </p>
          </div>
        ) : conversationId ? (
          !current_conversation.fetching_messages ? (
            <motion.div
              // initial={{ y: 300 }}
              // animate={{ y: 0 }}
              // transition={{ type: "tween", duration: 0.3, ease: "anticipate" }}
              // exit={{ y: "300" }}
              className="flex flex-row w-full border-t border-gray-200 py-[18px] pl-7 pr-5 flex-shrink-0"
            >
              <input
                onKeyDown={handleSendMessage}
                value={messageInput}
                onChange={handleMessageInputChnage}
                className="flex-1 outline-none text-[16px] mr-[16px]"
                type="text"
                ref={messageInputRef}
                placeholder="Send a message.."
                autoFocus={true}
              />
              {(conversationId || conversation_id) && (
                <div className="relative flex-shrink-0  p-2 hover:bg-mainHoverColor rounded-full cursor-pointer mr-2">
                  <input
                    type="file"
                    multiple
                    id="SparkHubAttachment"
                    onChange={handleUpload}
                    className="absolute opacity-0 hidden top-0 bottom-0 right-0 left-0 cursor-pointer-input "
                  />

                  <svg
                    className="w-[20px] h-[20px] cursor-pointer  hover:text-primary_color text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={(e) => {
                      e?.preventDefault();
                      document?.getElementById("SparkHubAttachment")?.click();
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    ></path>
                  </svg>
                </div>
              )}

              {sendButtonVisible && !upload_state.uploading && (
                <button
                  id="sendButton"
                  onClick={handleSendMessage}
                  disabled={!sendButtonVisible && upload_state.uploading}
                  className="flex-shrink-0 rounded-full hover:bg-mainHoverColor p-2"
                >
                  <svg
                    className="text-btnColor w-[20px] h-[20px] transform rotate-90 pointer-events-none"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                </button>
              )}
            </motion.div>
          ) : null
        ) : (
          <motion.div
            // initial={{ y: "200" }}
            // animate={{ y: 0 }}
            // transition={{ type: "tween", duration: 0.3, ease: "anticipate" }}
            // exit={{ y: 300 }}
            className="flex flex-row w-full border-t border-gray-200 py-[18px] pl-[28px] pr-[20px] flex-shrink-0"
          >
            <input
              onKeyDown={handleSendMessage}
              value={messageInput}
              ref={messageInputRef}
              onChange={handleMessageInputChnage}
              className="flex-1 outline-none text-[16px] mr-[16px]"
              type="text"
              placeholder="Send a message.."
              autoFocus={true}
            />

            {(conversationId || conversation_id) && (
              <div className="relative flex-shrink-0 mr-[8px] overflow-hidden  w-[20px] h-[20px] p-4 cursor-pointer">
                <input
                  type="file"
                  id="fileInput"
                  multiple
                  onChange={handleUpload}
                  className="   cursor-pointer  absolute top-0 left-0 right-0 bottom-0"
                />

                <svg
                  className="w-[20px] h-[20px]  hover:text-primary_color text-gray-500 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  ></path>
                </svg>
              </div>
            )}
            {sendButtonVisible && !upload_state.uploading && (
              <button
                id="sendButton"
                disabled={!sendButtonVisible && upload_state.uploading}
                onClick={handleSendMessage}
                className="flex-shrink-0 rounded-full hover:bg-gray-100 z-10"
              >
                <svg
                  className="text-btnColor w-[20px] h-[20px] transform rotate-90 pointer-events-none"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
