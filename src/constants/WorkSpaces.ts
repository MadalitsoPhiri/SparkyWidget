import { COMPANY_SIZE } from "@constants";
import { Users } from "./Users";

export interface WorkSpaces {
  _id: string;
  created_by: Users;

  company_size: COMPANY_SIZE;

  company_name: string;

  spark_gpt_agent: Users;
}
