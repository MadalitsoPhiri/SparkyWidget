import { motion } from "framer-motion";
import React, { FC, Fragment, useState } from "react";
import { useSelector } from "react-redux";
import { getInitialsFromName } from "../helpers/utilityFunctions";
import { auth_selector } from "../store/slices/auth_slice";
import { user_info_selector } from "../store/slices/userInfoSlice";
// import { Menu, Popover, Transition } from '@headlessui/react';
// import {
//   ChevronDownIcon,
//   LinkIcon,
//   XCircleIcon,
// } from '@heroicons/react/outline';
// import { LightningBoltIcon } from '@heroicons/react/solid';
// import { getInitialsFromName } from '../../../InboxPage/components/helpers';
// import { useSelector } from 'react-redux';
// import { authSelector } from '@/store/reducers/authReducers';
// import { MESSAGE_TYPE, USERTYPE } from '../../../../constants';

// import TimeAgo from "javascript-time-ago";
// import en from "javascript-time-ago/locale/en.json";
// import { MESSAGE_TYPE } from 'constants';
// TimeAgo.addDefaultLocale(en);
// const timeAgo = new TimeAgo("en-US");
// const actions = [
//   { name: "Delete", icon: <XCircleIcon className="w-4 h-4 mr-1" />, href: "#" },
//   {
//     name: "Copy link",
//     icon: <LinkIcon className="w-4 h-4 mr-1 text-black" />,
//     href: "#",
//   },
// ];
// function classNames(...classes) {
//   return classes.filter(Boolean).join(" ");
// }

const loadingContainer = {
  width: "1.3rem",
  height: "1rem",
  display: "flex",
  justifyContent: "space-around",
};

const loadingCircle = {
  display: "block",
  width: "0.25rem",
  height: "0.25rem",
  backgroundColor: "black",
  borderRadius: "50%",
};

const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const loadingCircleVariants = {
  start: {
    y: "50%",
  },
  end: {
    y: "150%",
  },
};

const loadingCircleTransition = {
  duration: 0.5,
  yoyo: Infinity,
  ease: "easeInOut",
};

interface TypingStatusProps{
  data:any
}
const TypingStatus:FC<TypingStatusProps> = ({ data }) => {
  const { currentUser, users_info } = useSelector(auth_selector);
  const lastIndex = 0
  const currentIndex = 0
  const {user} = useSelector(user_info_selector);
  const [img1Loaded, setImg1Loaded] = useState(false);
  //   <motion.div initial={{y:300}} animate={{y:0}} transition={{type:"tween"}} className="w-full flex flex-col items-end mb-[20px]"><p className="text-[14px] leading-[20px] text-white px-[16px] py-[16px] bg-headerBgColor  rounded-[6px] max-w-[90%] break-words mb-[4px]">
  //   {msg.content.text}
  // </p>

  // </motion.div>

  return (
    <div
      className="w-full flex flex-col  mb-5"
    >
      <div className="w-full mb-[8px] flex flex-row overflow-x-hidden items-end">
        {/* <div className="bg-gray-500 w-[32px] h-[32px] flex flex-row justify-center items-center flex-shrink-0 mr-[12px] mb-[20px] rounded-full ">
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
        </div> */}
        <div
          className={`rounded-full bg-[#6652A9] flex flex-row justify-center items-center w-[32px] h-[32px]  mr-[12px] mb-[20px]  ${
            img1Loaded ? 'hidden' : 'block'
          }`}>
          <p className="text-xs font-medium text-white">
            {!users_info.has(data._id)
              ? getInitialsFromName(data.user_name)
              : getInitialsFromName(
                  users_info.get(data._id).user_name,
                )}
          </p>
        </div>

        <div className="flex flex-col  bg-gray-300 rounded-md px-[16px] py-[16px] ">
          <motion.div
            style={loadingContainer}
            variants={loadingContainerVariants}
            initial="start"
            animate="end"
          >
            {[...Array(3)].map((_, index) => {
              return (
                <motion.span
                  key={index}
                  style={loadingCircle}
                  variants={loadingCircleVariants}
                  transition={loadingCircleTransition}
                />
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
export default TypingStatus;
