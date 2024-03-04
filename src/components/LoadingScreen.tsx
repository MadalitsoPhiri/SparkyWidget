import React, { FC } from "react";
import { Loader } from "./Loader";
interface LoaderProps {
  color: string;
}
const Loading:FC<LoaderProps> = ({ color }) =>{
  return (
    <div className="flex flex-col  w-full h-full bg-white">
      {/* toolbar */}
      <div className={`bg-headerBgColor h-[72px] w-full self-start`}></div>

      <Loader width={50} height={50} color={color} />
    </div>
  );
}
export default Loading
