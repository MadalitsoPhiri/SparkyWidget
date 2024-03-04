import React, {FC, useState} from "react"
import { motion } from 'framer-motion'
import { format } from 'timeago.js';
import LoadingCircle from "./LoadingCircle";
import { useSelector, useDispatch } from "react-redux";
import { sendPromptResponse } from "../store/slices/conversations_slice";

interface InputPromptProps{
  title:string,
  currentIndex:number,
  lastIndex:number,
  msg:any,
}
const InputPrompt:FC<InputPromptProps> = ({title,currentIndex,lastIndex, msg})=>{
  const [inputValue, setInputValue] = useState('');
  const dispatch = useDispatch()
  const handleSubmitPrompt = ()=>{
    if(inputValue === '' || inputValue === null || inputValue === undefined){
          
    }else{
      const payload = {...msg}
      payload.text = inputValue
      payload.sender = "client"
      dispatch(sendPromptResponse(payload) as any)
    }
     console.log("inputValue",inputValue)
    

  }
return (
    <motion.div initial={{y:300}} animate={{y:0}} transition={{type:"tween"}} className="w-full flex flex-col items-start mb-5" >
<div className="w-full mb-[8px] flex flex-row overflow-x-hidden items-end justify-end">
{lastIndex == currentIndex && <div className="bg-gray-500 w-[32px] h-[32px] flex flex-row justify-center items-center flex-shrink-0 mr-[12px] mb-[20px] rounded-full">
<svg className="w-[16px] h-[16px] text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path></svg>
</div>}
<div className="flex flex-col flex-1 max-w-[85%]">   
<div 
              className="rounded-[6px] border-btnColor flex-1 border-t-2  shadow-lg bg-white   mb-[6px]"
            >
              <div className="border border-t-none rounded-[6px] flex flex-col px-[24px] py-[26px] w-full ">
                <p className="text-gray-500 font-medium   mb-[12px]  text-[16px] leading-[24px]">
                  {title}
                </p>
                <div className="flex flex-row  h-[40px] border border-gray-300 rounded-[4px]">
                  <input
                    id="searchInput"
                    type={msg.prompt.cred === "Email"?"Email":"text"}
                    value={msg.status === "default"?msg.text:inputValue}
                    disabled={msg.prompt.submitted}
                    onChange={(e)=>setInputValue(e.target.value)}
                    className="min-w-0 focus:bg-white bg-gray-50 pl-[16px]  rounded-l-[4px] flex-1 h-full  outline-none shadow-inner text-[16px] leading-[20px]"
                  />
                {msg.status != "default"? <div onClick={handleSubmitPrompt} className="bg-btnColor w-[40px] h-full rounded-r-[4px] flex justify-center items-center cursor-pointer flex-shrink-0">
                    {msg.status === "waiting" ?<svg
                      className="w-[24px] h-[24px] text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg> :msg.status === "sending" ? <LoadingCircle />:null}
                    
                   
                  </div>:msg.status === "default" && msg.prompt.submitted ?<div className=" bg-gray-50 w-[40px] h-full rounded-r-[4px] flex justify-center items-center cursor-pointer flex-shrink-0"><svg className="w-[24px] h-[24px] text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>:null}
                </div>
              </div>
            </div>
            { lastIndex == currentIndex && <p className="text-[13px]  leading-[18px] font-light text-gray-700">{msg.sender} • {format(msg.date)}.</p> }
            </div>
            </div>
           
            </motion.div>
)
}

export default InputPrompt