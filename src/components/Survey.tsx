import React, { FC, useEffect } from 'react';
import { motion } from 'framer-motion';
import InfoCard from './InfoCard';
import { useSelector } from 'react-redux';
import { get_surveys, offersSelector } from '../store/slices/offersSlice';
import { useAppDispatch } from '@store';
import { useNavigate } from "react-router-dom";

type Option = {
  _id: string;
  title: string;
};

type Survey = {
  _id: string;
  headline: string;
  description: string;
  is_active: boolean;
  options: Option[];
};

const Survey = () => {
  const { survey } = useSelector(offersSelector);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(get_surveys());
  }, []);
  const handleSurveyItemClick = (survey: Survey, option: Option) => {
    navigate("/chat", {
      state: { isSurveyAnswer: true, payload: { survey, option } },
    });
  };
  return (
    <motion.div
      className=" flex flex-col py-1"
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "tween", duration: 0.4 }}
    >
      {survey?.survey.map(
        (item: Survey) =>
          item.is_active && (
            <InfoCard key={item._id}>
              <div className="flex flex-col p-4">
                <span className='font-semibold mb-[12px]  text-[16px] leading-[24px]"'>
                  {item.headline}
                </span>
                <span className="mb-4 text-[14px]">{item.description}</span>
                {item.options.map((option: Option) => (
                  <button
                    onClick={() => handleSurveyItemClick(item, option)}
                    key={option._id}
                    className={`border-btnColor rounded-[6px] border-2 flex flex-row justify-center items-center px-[28px] py-[10px] my-1`}
                  >
                    <p
                      className={` text-btnColor ml-[12px] font-semibold text-[16px] leading-[20px]`}
                    >
                      {option.title}
                    </p>
                  </button>
                ))}
              </div>
            </InfoCard>
          )
      )}
    </motion.div>
  );
};
export default Survey;
