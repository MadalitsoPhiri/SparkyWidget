import { CONTACT_TYPE, USERTYPE } from "@constants";
import { WorkSpaces } from "./WorkSpaces";

export interface UserLocation {
  longitude: string;
  latitude: string;
}

export interface UserCustomField {
  value: string;
  field: string;
}

export interface Users {
  _id: string;
  user_name: string;

  workspace: WorkSpaces;

  custom_fields: any;

  email: string;

  password: string;

  profile_picture_url: string;

  user_number: number;

  type: USERTYPE;

  first_seen: Date;

  last_seen: Date;
  signup_date: Date;

  last_heard: Date;

  last_clicked_link: Date;

  browser_lang: string;

  browser: string;

  device: string;

  device_platform: string;

  phone_number: string;

  last_contacted: Date;

  last_opened_email: Date;

  whatsapp_number: string;

  twitter_followers: string;

  last_known_location: UserLocation;

  owner: Users;

  city: string;

  country: string;

  job_title: string;

  bio: string;

  away: boolean;

  host_url: string;

  contact_type: CONTACT_TYPE;

  user_id: string;

  company_name: string;

  company_website: string;

  company_size: string;

  company_industry: string;

  verified: boolean;

  verification_code: string;
}
