import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import ConversationPreview from "./ConversationPreview";
import {
  conversation_slice_selector,
  get_more_conversations,
} from "../store/slices/conversations_slice";
import { useAppDispatch } from "@store";
import { Loader } from "./Loader";

export default function AllConversations() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    fetching_more_conversations,
    conversations,
    last_conversation_response,
  } = useSelector(conversation_slice_selector);
  const handleBack = () => {
    navigate(-1);
  };

  const handle_continue_conversation = (conversation_id: string) => {
    navigate(`/chat/${conversation_id}`);
  };
  const conversationListRef = useRef<HTMLDivElement>(null);
  const fetchingMoreConversationsRef = useRef(null);
  const lastConversationResponseRef = useRef<any>(null);
  const openConversationLengthRef = useRef<any>(null);
  useEffect(() => {
    const handleScroll = (e: any) => {
      const { scrollHeight, scrollTop, clientHeight } = e.target;
      const getMoreConversations = () => {
        if (fetchingMoreConversationsRef.current) {
          return;
        }
        dispatch(get_more_conversations());
      };
      if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
        if (
          lastConversationResponseRef.current?.count >
          openConversationLengthRef.current
        ) {
          getMoreConversations();
        }
      }
    };

    const conversationListElement = conversationListRef.current;

    if (conversationListElement) {
      conversationListElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (conversationListElement) {
        conversationListElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);
  useEffect(() => {
    fetchingMoreConversationsRef.current = fetching_more_conversations;
    lastConversationResponseRef.current = last_conversation_response;
    openConversationLengthRef.current = conversations.size;
  }, [fetching_more_conversations, last_conversation_response]);
  return (
    <div className="relative flex flex-col flex-1 w-full h-full bg-white overflow-y-auto">
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* toolbar */}
        <div
          className={`relative bg-headerBgColor py-[12px] px-[8px] flex flex-row flex-shrink-0`}
        >
          {/* back button */}
          <div
            onClick={handleBack}
            className=" z-10 px-[12px] py-[24px] flex justify-center items-center cursor-pointer h-0 hover:bg-[#0000002d]  rounded-[8px]"
          >
            <svg
              className="w-[28px] h-[28px] text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>

          <div
            className={`absolute top-0 bottom-0 right-0 left-0 flex flex-row items-center ml-[8px] w-full justify-center `}
          >
            <div>
              <p className="text-white text-lg">Your conversations</p>
            </div>
          </div>
        </div>
        {/* render conversations here*/}
        <div
          ref={conversationListRef}
          className="overflow-y-auto  flex-1 w-full h-full "
        >
          {Array.from(conversations.values()).map(
            (item: any, index: number) => {
              return (
                <div
                  key={index}
                  onClick={() => handle_continue_conversation(item._id)}
                >
                  <ConversationPreview data={item} renderBorder={true} />
                </div>
              );
            }
          )}

          {fetching_more_conversations && (
            <div className="flex justify-center p-5">
              <Loader width={20} height={20} color={"#6652A9"} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
