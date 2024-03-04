import React, { FC, useState } from "react";
import { format } from "timeago.js";
import { useSelector, useDispatch } from "react-redux";
import { user_info_selector } from "../store/slices/userInfoSlice";
import { getInitialsFromName } from "../helpers/utilityFunctions";
import { auth_selector } from "../store/slices/auth_slice";

interface ConversationPreviewProps {
  data: any;
  renderBorder: any;
}
const ConversationPreview: FC<ConversationPreviewProps> = ({
  data,
  renderBorder,
}) => {

  const { user_id } = useSelector(auth_selector);
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <div className="w-full flex flex-col h-auto  px-5   cursor-pointer hover:bg-mainHoverColor ">
      <div className="flex flex-row w-full items-center  py-3">
        {data.assigned_to.length ? (
          <div className="relative flex flex-row justify-center items-center rounded-full bg-[#6764B3] w-[32px] h-[32px] overflow-hidden mr-4">
            <p className="absolute text-xs text-white font-semibold">
              {getInitialsFromName(data.assigned_to[0]?.user_name)}
            </p>{" "}
            {/*username goes here*/}
            <img
              className={`absolute z-0 ${imgLoaded ? "block" : "hidden"}`}
              onError={() => setImgLoaded(false)}
              onLoad={() => setImgLoaded(true)}
              src={data.assigned_to[0]?.profile_picture_url}
            />
          </div>
        ) : (
          <div className="bg-gray-500 w-[32px] h-[32px] flex flex-row justify-center items-center flex-shrink-0  rounded-full mr-4">
            <svg
              className="w-[16px] h-[16px] text-white"
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

        <div className="flex-1 w-32">
          <p className=" text-xs font-light text-gray-400 mb-1">
            {data.last_message?.sender._id === user_id
              ? "You"
              : data.last_message?.sender.user_name}{" "}
            • {format(data.last_message?.createdAt)}
          </p>
          <p className="text-xs font-light truncate">{`${
            data.last_message?.sender._id === user_id
              ? "You"
              : data.last_message?.sender.user_name
          } : ${data.last_message?.content?.text}`}</p>
        </div>

        <svg
          className="text-btnColor w-6 h-6  flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </div>

      {renderBorder && <div className="border-b text-gray-300 w-full"></div>}
    </div>
  );
};
export default ConversationPreview