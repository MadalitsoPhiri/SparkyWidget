import { ATTACHMENT_TYPE, MESSAGE_TYPE } from "@constants";
import { v4 as uuid } from "uuid";
import { Messages } from "../constants/Message";
import { Users } from "../constants/Users";
import { Conversations } from "../constants/Conversations";
export const newCon = () => {
  const uniqueID = uuid();

  // const message = generateMessage(uniqueID,text)

  return {
    _id: uniqueID,
    allowInput: true,
    messages: [],
    fetchingMessages: false,
    fetchedMessages: true,
    lastMessage: null,
  };
};
export const generate_message = (
  user: Users,
  messageArgs?: Messages,
  conversation?: Conversations
) => {
  const MessageId = uuid();
  const final_message: Messages = {
    _id: MessageId,
    content: {
      text: messageArgs?.content?.text || "",
      payload: messageArgs?.content?.payload || {},
    },
    sender: user,
    seen: false,
    prompt: messageArgs?.prompt || {},
    attachments: [],
    conversation: conversation || null,
    tags: [],
    status: messageArgs?.status || "sending",
    type: messageArgs?.type || MESSAGE_TYPE.TEXT,
    is_prompt: false,
  };
  return final_message;
};
export const generate_temp_conversation = (user: any) => {
  const con_id = uuid();
  return {
    _id: con_id,
    typing: null,
    messages: new Map(),
    fetching_messages: false,
    fetched_messages: true,
    sending_message: false,
    last_message: null,
    created_by: user,
  };
};
export const findConversationIndex = (state: any, conversationId: string) => {
  return state.value.findIndex((item: any) => {
    if (conversationId === item._id) {
      return true;
    } else {
      return false;
    }
  });
};

export const findMessageIndex = (
  state: any,
  conversationIndex: number,
  messageId: string
) => {
  return state.value[conversationIndex].messages.findIndex((item: any) => {
    if (messageId === item._id) {
      return true;
    } else {
      return false;
    }
  });
};
const checkCookiesEnable = () => {
  let isCookieEnabled = window.navigator.cookieEnabled ? true : false;
  if (
    typeof window.navigator.cookieEnabled == "undefined" &&
    !isCookieEnabled
  ) {
    document.cookie = "testcookie";
    isCookieEnabled =
      document.cookie.indexOf("testcookie") != -1 ? true : false;
  }

  return isCookieEnabled;
};
const writeCookie = (name: string, value: any, days?: any) => {
  console.log("cookie name", name);
  console.log("cookie value", value);
  var expires = "";
  var expires2 = "; expires=Tue, 19 Jan 2038 03:14:07 UTC";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie =
    name +
    "=" +
    (value || "") +
    expires2 +
    "; path=/" +
    ";SameSite=None;Secure";
};
export async function setCookie(name: string, value: any, days?: any) {
  if (checkCookiesEnable()) {
    writeCookie(name, value);
  } else {
    // handle browsers that dont support third party cookies
    console.log("browser does not support third party cookies");
    const result = await checkStorageApiAccess();
    console.log("storage access", result);
    if (result) {
      writeCookie(name, value);
    }
  }
}
const extractCookie = (cname: string) => {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
};
export async function getCookie(cname: string) {
  if (checkCookiesEnable()) {
    return extractCookie(cname);
  } else {
    // handle browsers that dont support third party cookies
    console.log("browser does not support third party cookies");
    const result = await checkStorageApiAccess();
    console.log("storage access", result);
    if (result) {
      return extractCookie(cname);
    }
  }
}
export function eraseCookie(name: string) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

export const getInitialsFromName = (name: string) => {
  if (!name) return "";
  const nameArray = name.split(" ");
  if (nameArray.length >= 2) {
    const FirstLetter = nameArray[0][0];
    const SecondLetter = nameArray[1][0];
    return FirstLetter.toUpperCase() + SecondLetter.toUpperCase();
  } else {
    const lastLetterIndex = nameArray[0].length - 1;
    const FirstLetter = nameArray[0][0];
    const SecondLetter = nameArray[0][lastLetterIndex];
    return FirstLetter.toUpperCase() + SecondLetter.toUpperCase();
  }
};

const checkStorageApiAccess = async () => {
  try {
    if (!!document.hasStorageAccess) {
      const result = await document.hasStorageAccess();
      console.log("hasStorageAccess", result);

      if (!result) {
        console.log("requesting StorageAccess");
        const result2 = await document.requestStorageAccess();
        console.log("requesting StorageAccess");
        window.location.reload();
        return result2;
      } else {
        return result;
      }
    }
  } catch (err: any) {
    console.log("error", err);
    return false;
  }
};

export const getAttachmentType = (attachment: any) => {
  if (attachment.type.includes("image")) {
    return ATTACHMENT_TYPE.IMAGE;
  } else if (attachment.type.includes("audio")) {
    return ATTACHMENT_TYPE.AUDIO;
  } else if (attachment.type.includes("video")) {
    return ATTACHMENT_TYPE.VIDEO;
  } else {
    return ATTACHMENT_TYPE.FILE;
  }
};

export const convertToAttachmentEntity = (attachment: any) => {
  const result = {
    type: getAttachmentType(attachment.file),
    attachment_url: attachment.url,
    attachment_name: attachment.file.name,
    backup_url: URL.createObjectURL(attachment.file),
  };
  return result;
};

export const downloadFile = (url: string, fileName: string = "example") => {
  fetch(url, { method: "get", mode: "no-cors", referrerPolicy: "no-referrer" })
    .then((res) => res.blob())
    .then((res) => {
      const aElement = document.createElement("a");
      aElement.setAttribute("download", fileName);
      const href = URL.createObjectURL(res);
      aElement.href = href;
      aElement.setAttribute("target", "_blank");
      aElement.click();
      URL.revokeObjectURL(href);
    });
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};


export const pickTextColorBasedOnBgColorAdvanced = (
  bgColor: string,
  lightColor: string,
  darkColor: string
) => {
  var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ?
    darkColor : lightColor;
};

export const generateRandomID = () => {
  return uuid();
};
