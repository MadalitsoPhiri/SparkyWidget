import { MESSAGE_TYPE } from "@constants";
import { Conversations } from "./Conversations";
import { Users } from "./Users";
import { Tags } from "./Tags";

export interface Prompt {
  title: string;
  submitted: boolean;
  value: string;
}

export interface Attachments {
  type: string;
  attachment_name: string | null;
  attachment_url: string | null;
}
export interface Content {
  text: string;
  payload: any;
}
export interface Messages {
  _id: string;
  conversation: Conversations | string | null;

  sender: Users | string;

  type: MESSAGE_TYPE;

  content: Content | null;

  attachments: Attachments[];

  prompt: Prompt | {};
  is_prompt?: boolean;

  seen: boolean;

  tags: Tags[] | string[];
  status?: string;
}
