export const defaultDomain = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
  : "http://localhost:4000/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  ? import.meta.env.VITE_SOCKET_URL
  : "ws://localhost:4000";

export const SOCKET_EVENT_NAME = {
  GET_CONVERSATIONS: "get_conversations",
  GET_CONFIG: "get_config",
  GET_MESSAGES: "get_messages",
  UPDATE_USER_INFO: "update_user_info",
  GET_USER_INFO: "get_user_info",
  UPDATE_CONFIG: "update_config",
};

export enum ATTACHMENT_TYPE {
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  FILE = "FILE",
  IMAGE = "IMAGE",
  CODE_SNIPPET = "CODE_SNIPPET",
  STICKER = "STICKER",
}
export enum MESSAGE_TYPE {
  ARTICLE = "ARTICLE",
  NOTE = "NOTE",
  TEXT = "TEXT",
  INFO = "INFO",
  WARNING = "WARNING",
  PROMPT = "PROMPT",
  SURVEY_ANSWER = "SURVEY_ANSWER",
  REPLY = "REPLY",
  SWITCH_TO_AGENT = 'SWITCH_TO_AGENT',
}

export const MESSAGE_STATUS = {
  SENDING: "sending",
  DEFAULT: "default",
};
export enum UPLOAD_STATUS {
  WAITING = "waiting",
  UPLOADING = "uploading",
  ERRORED = "error",
  COMPLETED = "completed",
}
export enum USERTYPE {
  AGENT = "AGENT",
  CLIENT = "CLIENT",
  BOT = 'BOT',
}

export enum COMPANY_SIZE {
  XXS = "XXS",
  XS = "XS",
  SM = "SM",
  MD = "MD",
  LG = "LG",
  XL = "XL",
  XXL = "XXL",
}
export enum COOKIES {
  AUTH = "uid",
  CLIENT_AUTH = "client_uid",
}
export const get_agents_room_id = (root_account_id: string) =>
  `${root_account_id}:agents`;
export const generate_session_key = (id: string) => `SESSIONS:${id}`;
export enum CONVERSATION_ACCESS {
  ALL = "ALL",
  ASSIGNED_ONLY = "ASSIGNED_ONLY",
  ASSIGNED_TO_TEAM = "ASSIGNED_TO_TEAM",
  UNASSIGNED = "UNASSIGNED",
}

export enum CONTACT_TYPE {
  LEAD = "Lead",
  USER = "User",
}
export enum CONVERSATION_STATUS {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  SNOOZED = "SNOOZED",
}
export enum CONVERSATION_TYPE {
  GROUP = "GROUP",
  COLABORATION = "COLABORATON",
  SINGLE = "SINGLE",
}
