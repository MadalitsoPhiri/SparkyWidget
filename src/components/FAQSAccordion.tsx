import React, { FC, useState } from 'react';
import { motion, AnimatePresence} from 'framer-motion'

interface AccordionProps{
  question:any,
  answer:any,
}
const Accordion:FC<AccordionProps> = ({ question, answer }) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <motion.div>
      <AnimatePresence>
    <motion.div className="bg-white border-x-0 border-b-0 border-t w-full">
      <div className={`flex flex-row py-3 px-4 items-center space-x-4 cursor-pointer text-gray-500`} onClick={() => setIsActive(!isActive)}>
        <div className={isActive ? 'text-red-500 font-bold text-[20px]' : 'text-gray-500 font-bold text-[20px]'}>{isActive ? '−' : '+'}</div>
        <div className='text-[15px] font-medium text-btnColor '>{question}</div>
      </div>
      {isActive && <motion.div 
      className="py-3 px-4 space-x-4 text-gray-500 ">{answer}</motion.div>}
    </motion.div>
    </AnimatePresence>
    </motion.div>
  );
};

export default Accordion