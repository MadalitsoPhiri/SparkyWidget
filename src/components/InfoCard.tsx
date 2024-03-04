import React, { FC } from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from "react-redux";


interface InfoCardProps{
  children?: React.ReactNode
}
const InfoCard:FC<InfoCardProps> = ({children})=> {
  const config = useSelector((state:any) => state.config.value);
    return (
        <motion.div className="border-borderColor border-t-2 rounded-[6px] shadow-lg bg-white w-full  mb-4" initial={{y:200,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"tween",duration:0.4}}>
            <div className="border border-t-none rounded-[6px] h-full">
              {children}
            </div>
          </motion.div>
    )
}
export default InfoCard;