import React, { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Accordion from "./FAQSAccordion";
import InfoCard from "./InfoCard";
import { auth_selector } from "../store/slices/auth_slice";

interface FAQsProps {
  widget_id: string;
}
const FAQs: FC<FAQsProps> = ({ widget_id }) => {
  let navigate = useNavigate();

  const [faqs, set_faqs] = useState([]);
  const { socket } = useSelector(auth_selector);
  const handleSeeAllQuestions = () => {
    navigate(`/allQuestions/`);
  };
  const get_faqs = () => {
    console.log("getting faqs", widget_id);
    socket.emit(
      "get_faqs",
      { event_name: "get_faqs", data: { widget_id } },
      (response: any) => {
        if (response.data) {
          set_faqs(response.data);
        }

        console.log("faqs", response);
      }
    );
  };
  useEffect(() => {
    if (faqs.length <= 0) get_faqs();
  }, []);
  // const config = useSelector((state) => state.config.value);

  return faqs.length > 0 ? (
    <motion.div
      className=" flex flex-col py-1"
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "tween", duration: 0.4 }}
    >
      <InfoCard>
        <div className="font-semibold text-[20px]  p-3">
          <p className="mr-3">FAQs</p>
        </div>
        <div className="h-full">
          {faqs.slice(0, 3).map(({ question, answer }, index) => (
            <Accordion question={question} answer={answer} key={index} />
          ))}
        </div>
        {faqs.length > 3 && (
          <div className="px-5 py-4 w-full h-auto flex flex-row items-center border-t">
            <button onClick={() => handleSeeAllQuestions()}>
              <p className="text-btnColor text-xs hover:text-textHoverColor">
                See all questions
              </p>
            </button>
          </div>
        )}
      </InfoCard>
    </motion.div>
  ) : null;
};
export default FAQs;
