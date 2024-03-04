import React, { FC, MouseEventHandler } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import conversations_slice from "../store/slices/conversations_slice";
import { AVAILABILITY } from "../constants/availability";
import { pickTextColorBasedOnBgColorAdvanced } from "../helpers/utilityFunctions";

interface SparkConversationProps {
  handleSendMesage: Function;
}
const SparkConversation: FC<SparkConversationProps> = ({
  handleSendMesage,
}) => {
  const config = useSelector((state:any) => state.config.value);
  const conversationCount = 0;
  return (
    <div>
      <motion.div
        className="border-borderColor border-t-2 rounded-[6px] shadow-lg bg-white w-full  mb-[16px]"
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "tween", duration: 0.4 }}
      >
        <div className="border border-t-none rounded-[6px] px-[24px] py-[26px]">
          <p className="mb-[16px] text-[16px] leading-[24px] font-semi-bold">
            {conversationCount === 0
              ? "Start a conversation"
              : "Start another conversation"}
          </p>
          <div className="flex flex-row mb-[16px] items-center">
            <div className="mr-[16px] flex flex-row  p-2">
              {config.workspace.created_by.profile_picture_url ? (
                <img
                  src={config.workspace.created_by.profile_picture_url}
                  className="rounded-full w-[56px] h-[56px]"
                />
              ) : (
                <div className="bg-gray-500 w-[56px] h-[56px] flex flex-row justify-center items-center flex-shrink-0  rounded-full">
                  <svg
                    className="w-[20px] h-[20px] text-white"
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
            <div>
              <p className="text-[#737376] text-[14px] leading-[20px font-light">
                Our usual reply time
              </p>
              <div className="flex flex-row justify-start items-center">
                <svg
                  className={`text-[${pickTextColorBasedOnBgColorAdvanced( config.colors.btn_color,config.colors.btn_color,'#000000')}]  w-[16px] h-[16px] mr-[8px]`}
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
                <p className="text-black text-[14px] leading-[20px] font-semibold">
                  {config.availability.reply_time || AVAILABILITY.DYNAMIC}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSendMesage as MouseEventHandler<HTMLButtonElement>}
            className={`${
              conversationCount === 0 ? "bg-btnColor" : "transparent"
            } ${"border-btnColor"} rounded-full border-2 flex flex-row justify-center items-center px-[28px] py-[10px]`}
          >
            <svg
              className={`${
                conversationCount === 0 ? `text-textBtnColor` : "text-btnColor"
              } w-[24px] h-[24px] transform rotate-90`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
            </svg>
            <p
              className={`${
                conversationCount === 0 ? `text-textBtnColor` : "text-btnColor"
              } ml-[12px] text-[14px] leading-[20px]`}
            >
              Send us a message
            </p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
export default SparkConversation;
