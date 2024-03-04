import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import io from "socket.io-client";
import {
  defaultDomain,
  SOCKET_EVENT_NAME,
  SOCKET_URL,
  USERTYPE,
} from "@constants";
import { enableMapSet } from "immer";
import { AppProps } from "../../App";

enableMapSet();

const generate_socket_instance = async (payload: AppProps, userId: string) => {
  if (userId) {
    return io(SOCKET_URL, {
      extraHeaders: {
        Type: USERTYPE.CLIENT,
        "Widget-id": payload.widgetId,
        "Widget-host-origin": payload.origin,
        [payload.widgetId]: userId,
      },
      withCredentials: true,
    });
  } else {
    return io(SOCKET_URL, {
      extraHeaders: {
        Type: USERTYPE.CLIENT,
        "Widget-id": payload.widgetId,
        "Widget-host-origin": payload.origin,
      },
      withCredentials: true,
    });
  }
};
export const STATE_KEY = "auth";
export const auth_slice = createSlice({
  name: STATE_KEY,
  initialState: {
    socket: null,
    users_info: new Map(),
    user_id: null,
    widget_info: { origin: null, widgetId: null },
    origin: null,
  },
  reducers: {
    set_socket: (state: any, action: PayloadAction<any>) => {
    
        state.socket = action.payload;

      
    },
    update_user_info(state, action) {
      const { _id } = action.payload;
      if (_id) {
        state.users_info.set(_id, action.payload);
      }
    },
    set_user_id: (state, action: any) => {
      if (action.payload) {
        state.user_id = action.payload;
      }
    },
    set_widget_info(state, action) {
      if (action.payload) {
        state.widget_info = action.payload;
      }
    },
  },
});

export const { update_user_info, set_widget_info, set_user_id, set_socket } =
  auth_slice.actions;
export default auth_slice.reducer;
export const auth_selector = (state: any) => state[STATE_KEY];
export const retry_socket_connection =
  () => async (dispatch: any, get_state: any) => {
    // a thunk to retry socket connect
    dispatch(set_socket(null));
    const response = await fetch(`${defaultDomain}/auth/temp_client_signup`, {
      method: "POST",
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache",
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer",
      body: JSON.stringify({
        widget_id: get_state().auth.widget_info.widgetId,
      }),
    });
    const json_response = await response.json();
    if (json_response._id) {
      dispatch(set_user_id(json_response._id));
      parent.postMessage(
        { event_name: "set_cookie", userId: json_response._id },
        "*"
      );
    }
    dispatch(connect_socket());
  };
export const get_user_info = (id: string) => (dispatch: any, getState: any) => {
  const socket = getState().auth.socket;
  socket.emit(
    SOCKET_EVENT_NAME.GET_USER_INFO,
    { event_name: SOCKET_EVENT_NAME.GET_USER_INFO, data: { id } },
    (response: any) => {
      if (response.data) {
        dispatch(update_user_info(response.data));
      }
    }
  );
};
export const connect_socket = () => async (dispatch: any, getState: any) => {
  const state = getState().auth;
  const socket = await generate_socket_instance(
    state.widget_info,
    state.user_id
  );
  if (!state.socket) {
    dispatch(set_socket(socket));
  }
};
