import React, { FC, useState } from "react";
import { format } from "timeago.js";
import { motion } from "framer-motion";
import InputPrompt from "./InfoPrompt";
import { useSelector } from "react-redux";
import { user_info_selector } from "../store/slices/userInfoSlice";
import {
  ATTACHMENT_TYPE,
  MESSAGE_STATUS,
  MESSAGE_TYPE,
  USERTYPE,
} from "@constants";
import { auth_selector } from "../store/slices/auth_slice";
import { getInitialsFromName } from "../helpers/utilityFunctions";
import { ImageAttachments } from "./ImageAttachments";
import { FileAttachments } from "./FileAttachments";

interface MessageProps {
  msg: any;
  index: number;
  dataSet: any;
  handleSendSwitchOver: () => void;
}
const Message: FC<MessageProps> = ({
  msg,
  index,
  dataSet,
  handleSendSwitchOver,
}) => {
  const MessageArray = Array.from(dataSet.values()).filter(
    (message: any) => message.type !== MESSAGE_TYPE.INFO
  );
  const lastIndex = MessageArray.length - 1;
  const currentIndex = index;
  const { user } = useSelector(user_info_selector);
  const { users_info, user_id } = useSelector(auth_selector);
  const [img1Loaded, setImg1Loaded] = useState(false);
  const [aIModalOpen, setAIModalOpen] = useState(false);

  return msg.type === MESSAGE_TYPE.INFO ? null : msg.sender._id != user_id ? (
    msg.isPrompt && msg.prompt.type === "UserCredential" ? (
      <InputPrompt
        title={msg.prompt.title}
        lastIndex={lastIndex}
        currentIndex={currentIndex}
        msg={msg}
      />
    ) : (
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "tween" }}
        className="w-full flex flex-col items-start mb-5 "
      >
        <div className="w-full mb-[8px] flex flex-row overflow-x-visible overflow-y-visible items-end relative">
          {lastIndex == currentIndex &&
            (msg.sender.profile_picture_url ? (
              <img
                src={msg.sender.profile_picture_url}
                className="rounded-full w-[32px] h-[32px]  mr-[12px] mb-[20px]"
              />
            ) : (
              <div
                className={`rounded-full bg-[#6652A9] flex flex-row justify-center items-center w-[32px] h-[32px]  mr-[12px] mb-[20px]  ${
                  img1Loaded ? "hidden" : "block"
                }`}
              >
                <p className="text-xs font-medium text-white">
                  {!users_info.has(msg.sender._id)
                    ? getInitialsFromName(msg.sender.user_name)
                    : getInitialsFromName(
                        users_info.get(msg.sender._id).user_name
                      )}
                </p>
              </div>
            ))}
          <div className={`flex flex-col max-w-[85%] `}>
            <div className=" rounded-md  bg-[#e6e4e7] mb-[4px]">
              <div className="px-[16px] py-[16px]">
                <p className=" text-[14px] leading-[20px] text-black flex-1    w-full mb-[4px]">
                  {msg.content.text}
                </p>

                <ImageAttachments msg={msg} />
                <FileAttachments msg={msg} />
              </div>

              {msg.sender.type == USERTYPE.BOT && (
                <div className="border-t-[1px] border-gray-300 p-2 w-full flex flex-row  justify-between items-center ">
                  <div className="flex flex-row justify-center items-center">
                    <div className="bg-gray-500 rounded-md   px-[4px] py-[2px] mr-1 flex flex-row justify-center items-center">
                      <p className="text-white font-bold text-[10px]">AI</p>
                    </div>
                    <p className="font-medium text-xs text-gray-500">Answer</p>
                  </div>
                  <svg
                    onClick={() => setAIModalOpen(!aIModalOpen)}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-500 cursor-pointer"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  {aIModalOpen && (
                    <div className="rounded-md bg-black absolute p-2 -bottom-11 left-[-10px] max-w-[90%] z-10">
                      <p className="text-white font-medium text-[12px]">
                        AI answers are generated based on both public and
                        private sources provided by SparkHub.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {lastIndex == currentIndex && (
              <p className="text-[13px]  leading-[18px] font-light text-gray-700">
                {msg.sender.user_name} • {format(msg.createdAt)}
              </p>
            )}
          </div>
        </div>
        {lastIndex == currentIndex && msg.sender.type === USERTYPE.BOT && (
          <div className="flex flex-col items-end justify-end h-full mt-2 w-full">
            <div
              onClick={handleSendSwitchOver}
              className="group rounded-[8px] p-[10px] bg-mainHoverColor mb-[8px] hover:bg-headerBgColor cursor-pointer"
            >
              <p className="text-chatOptionsTextColor group-hover:text-chevronColor  text-[14px] leading-[20px]">
                speak to an agent
              </p>
            </div>
          </div>
        )}
      </motion.div>
    )
  ) : msg.sender._id === user._id && msg.type == MESSAGE_TYPE.PROMPT ? (
    <InputPrompt
      title={msg.prompt.title}
      lastIndex={lastIndex}
      currentIndex={currentIndex}
      msg={msg}
    />
  ) : (
    <motion.div
      initial={{ y: 300 }}
      animate={{ y: 0 }}
      transition={{ type: "tween" }}
      className="w-full flex flex-col items-end mb-[20px]"
    >
      <div className=" px-[16px] rounded-[6px] py-[16px] max-w-[90%] bg-headerBgColor mb-[4px]">
        <p className="text-[14px] leading-[20px] text-chevronColor   ">
          {msg.content.text}
        </p>
        <ImageAttachments msg={msg} />
        <FileAttachments msg={msg} />
      </div>

      {(lastIndex == currentIndex || msg.status === MESSAGE_STATUS.SENDING) && (
        <p className="text-[13px] leading-[18px] font-light text-gray-700">
          {msg.status === MESSAGE_STATUS.DEFAULT
            ? `${format(msg.createdAt, "en_US")} • ${
                msg.seen === false ? "not seen yet" : "seen"
              }`
            : msg.status}
        </p>
      )}
    </motion.div>
  );
};
export default Message;