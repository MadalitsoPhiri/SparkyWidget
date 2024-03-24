import React, { useEffect } from "react";
import InfoCard from "./InfoCard";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import ConversationPreview from "./ConversationPreview";
import AskSparky from "./AskSparky";
import SparkConversation from "./SparkConversation";
import {
  conversation_slice_selector,
  get_conversations,
} from "../store/slices/conversations_slice";
import LoadingScreen from "./LoadingScreen";
import FAQs from "./FAQS";
import Survey from "./Survey";
import Carousel from "./Carousel";
import { auth_selector } from "../store/slices/auth_slice";


const widget_id = document.currentScript?.getAttribute("data-bot-id");
export default function Home() {
  const navigate = useNavigate();

  const conversationState = useSelector(
    (state: any) => state.conversations.value
  );
  const {widget_info} = useSelector(auth_selector);
  const dispatch = useDispatch();
  const hasFetchedOnce = useSelector(
    (state: any) => state.conversations.hasFetchedOnce
  );
  const isLoading = useSelector((state: any) => state.conversations.isLoading);
  const config = useSelector((state: any) => state.config.value);
  const { conversations } = useSelector(conversation_slice_selector);
  const conversationCount = conversationState.length;
  const handleSendMesage = () => {
    navigate("/chat");
  };

  const handle_continue_conversation = (conversation_id: string) => {
    navigate(`/chat/${conversation_id}`);
  };

  const handleSeeAllConversations = () => {
    navigate(`/allConversations/`);
  };

  useEffect(() => {
    if (!hasFetchedOnce) {
      dispatch(get_conversations() as any);
    }
  }, []);

  useEffect(() => {
    // console.log('conversation map: ', conversations)
  }, [conversations]);
  if (isLoading) {
    return <LoadingScreen color={config.colors.header_bg_color} />;
  }
  return (
    <motion.div
      className="relative flex flex-1 w-full h-full bg-white overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -200 }}
    >
      <div className="bg-headerBgColor absolute h-[256px] w-full"></div>
      <div className="bg-transparent w-full h-full z-10 overflow-y-auto py-[16px]">
        <motion.div
          className="bg-headerBgColor w-full  mb-[16px] p-[20px]"
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "tween", duration: 0.4 }}
        >
            {config?.images?.brand_logo_url &&
            config?.images?.brand_logo_url !== '' ? (
              <div className="flex justify-center items-center w-[100px] h-[100px] mb-[16px]">
                <img
                src={config.images.brand_logo_url}
                alt="logo goes here"
                className="flex-none"
              />
              </div>
            ) : (
              <svg
                className="w-[32px] h-[32px] mb-[16px] text-[#FDD518]"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"></path>
              </svg>
            )}
          <p className={` text-headerTextColorActual font-normal text-[30px] mb-[16px]`}>
            {config.greetings.header.main}
          </p>
          <p className={`text-headerTextColorActual font-extralight text-[13px]`}>
            {config.greetings.header.description}
          </p>
        </motion.div>

        {conversations.size > 0 && (
          <div className="px-[16px]">
            <InfoCard>
            <div className="w-full">
              <p className="text-base mt-[24px] mb-[12px] mx-[24px]">
                Continue the conversation
              </p>
              {Array.from(conversations.values())
                .slice(0, 3)
                .map((item: any, index) => {
                  const renderLastBorder = index < 2;
                  console.log("item:", item);
                  return (
                    <div
                      key={index}
                      onClick={() => handle_continue_conversation(item._id)}
                    >
                      <ConversationPreview
                        data={item}
                        renderBorder={renderLastBorder}
                      />
                    </div>
                  );
                })}
            </div>
            {conversations.size > 3 && (
              <div className="px-5 py-4 w-full h-auto flex flex-row items-center border-t border-gray-300">
                <button onClick={() => handleSeeAllConversations()}>
                  <p className="text-btnColor text-xs hover:text-textHoverColor">
                    See all your conversations
                  </p>
                </button>
              </div>
            )}
          </InfoCard>
          </div>
        )}
        {/* <!-- Spark a conversation component --> */}

        <div className="px-[16px]">
        <SparkConversation handleSendMesage={handleSendMesage} />
        </div>

        {/* <!-- ask sparky component --> */}
        {/* <div className="px-[16px]">
        <AskSparky />
        </div> */}

        {/* <WheelOfFortune /> */}
        {/* <InfoCard>
          <div className="w-full h-full  flex flex-col cursor-pointer">
            <img
              className="justify-self-center object-contain w-full"
              src="https://storage.googleapis.com/propzi-1e9c2.appspot.com/Black%20and%20White%20Summer%20Collage%20Instagram%20Post%20(1)%201.png"
            />
            <div className="w-full h-auto bg-[#FAFAFA] flex flex-col p-[16px]">
              <p className="text-bgColor font-bold text-[16px] leading-[20px]">
                Brampton Launch Giveaway
              </p>
              <p className="text-[#818283] text-[16px] leading-[20px]">
                {' '}
                Visit us for our new store launch this Sunday! We have prizes,
                contests, ice-cream and more.
              </p>
            </div>
          </div>
        </InfoCard> */}
        {/* Client survey*/}
        <div className="px-[16px]">
        <Survey />
        </div>

        {/* Carousel */}
        <Carousel />

        {/*frequently asked questions */}
        <div className="px-[16px]">
        <FAQs widget_id={widget_info.widgetId as string} />
        </div>


        {/* <div className="border-[#9f8bb8] border-t-2 rounded-md shadow-lg bg-white w-full h-20 mb-4">
            <div className="border border-t-none rounded-sm h-full">
            </div>
          </div> */}
      </div>
    </motion.div>
  );
}