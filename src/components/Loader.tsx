import React, { FC } from 'react';

interface LoaderProps{
  width:number,
  height:number,
  color:string,
}
export const Loader:FC<LoaderProps> = ({ width, height, color }) => {
  return (
    <div className="flex-1  flex justify-center items-center">
      <div
        style={{ borderColor:color  ,borderTopColor: 'transparent',width:width,height }}
        className={` border-2  outline-none border-solid rounded-full animate-spin `}></div>
    </div>
  );
};
