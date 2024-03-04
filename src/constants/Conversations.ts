import { CONVERSATION_STATUS, CONVERSATION_TYPE } from "@constants";
import { Messages } from "./Message";
import { Tags } from "./Tags";
import { Users } from "./Users";
import { WorkSpaces } from "./WorkSpaces";

export interface Conversations {
  _id: string;
  workspace: WorkSpaces | string;
  root_account: Users | string;

  type: CONVERSATION_TYPE;

  created_by: Users | string;

  assigned_to: Users[] | string[];

  lead: Users | string | null;

  participants: [Users] | [string];

  admins: [Users] | [string];

  status: CONVERSATION_STATUS;

  title: string | null;

  last_message: Messages | null;

  tags: Tags[] | string[];

  updatedAt: string;
}
