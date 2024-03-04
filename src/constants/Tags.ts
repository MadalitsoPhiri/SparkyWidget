import { Users } from "./Users";

export interface Tags {
  _id: string;
  name: string;

  created_by: Users;
}
