import React, { useState } from "react";
import InfoCard from "./InfoCard";
import "./WheelAnimation.css";

function WheelOfFortune() {
  const [name, setName] = useState("wheel");
  const startSPinning = () => {
    setName("wheel start-animation");
    console.log("started to spin");
    setTimeout(() => {
      setName("wheel start-animation stop-rotate");
    }, Math.floor(Math.random() * 10000 + 1));
  };
  return (
    <InfoCard>
      <div className="w-full h-full  flex flex-col">
        <div className="w-full h-auto bg-[#FAFAFA] flex flex-col py-10">
          <p className="text-[#602E9E] font-bold text-[16px] leading-[20px] text-center	"></p>
          <div className="relative">
            <button
              onClick={startSPinning}
              className="z-50 p-2 text-xs		absolute bg-black text-white"
              style={{
                left: "38%",
                top: "-30px",
              }}
            >
              Tap to spin
            </button>
            <div
              className="absolute w-0	h-0 z-10"
              style={{
                left: "45%",
                top: "-30px",
                borderLeft: "15px solid transparent",
                borderRight: "15px solid transparent",
                borderTop: "50px solid #000",
              }}
            ></div>
          </div>
          <ul
            className={`${name} mx-auto	py-4  border-4 border-light-blue-500 rounded-full w-72 h-72 relative overflow-hidden bg-gray-600 `}
          >
            <li
              className="bg-red-600 absolute overflow-hidden  top-0 right-0 w-1/2 h-1/2"
              style={{
                transform: "rotate(0deg) skewY(-60deg)",
                transformOrigin: "0% 100%",
              }}
            >
              <div
                className=" absolute p-5 cursor-pointer text-center"
                style={{
                  left: "-100%",
                  width: "200%",
                  height: "200%",
                  transform: "skewY(60deg) rotate(15deg)",
                }}
              >
                1
              </div>
            </li>
            <li
              style={{
                transform: "rotate(30deg) skewY(-60deg)",
                transformOrigin: "0% 100%",
              }}
              className="bg-yellow-600 overflow-hidden 		 absolute top-0 right-0 w-1/2 h-1/2"
            >
              <div
                className=" absolute p-5	cursor-pointer text-center"
                style={{
                  left: "-100%",
                  width: "200%",
                  height: "200%",
                  transform: "skewY(60deg) rotate(15deg)",
                }}
              >
                2
              </div>
            </li>
            <li
              style={{
                transform: "rotate(60deg) skewY(-60deg)",
                transformOrigin: "0% 100%",
              }}
              className="bg-indigo-600 overflow-hidden 	absolute top-0 right-0 w-1/2 h-1/2"
            >
              <div
                className=" absolute p-5	cursor-pointer	 text-center"
                style={{
                  left: "-100%",
                  width: "200%",
                  height: "200%",
                  transform: "skewY(60deg) rotate(15deg)",
                }}
              >
                3
              </div>
            </li>
            <li
              style={{
                transform: "rotate(90deg) skewY(-60deg)",
                transformOrigin: "0% 100%",
              }}
              className="bg-pink-600 overflow-hidden 	absolute top-0 right-0 w-1/2 h-1/2"
            >
              <div
                className=" absolute p-5	cursor-pointer	 text-center"
                style={{
                  left: "-100%",
                  width: "200%",
                  height: "200%",
                  transform: "skewY(60deg) rotate(15deg)",
                }}
              >
                4
              </div>
            </li>
            <li
              style={{
                transform: "rotate(120deg) skewY(-60deg)",
                transformOrigin: "0% 100%",
              }}
              className="bg-blue-600 overflow-hidden 		absolute top-0 right-0 w-1/2 h-1/2"
            >
              <div
                className=" absolute p-5	cursor-pointer text-center"
                style={{
                  left: "-100%",
                  width: "200%",
                  height: "200%",
                  transform: "skewY(60deg) rotate(15deg)",
                }}
              >
                5
              </div>
            </li>
            <li
              style={{
                transform: "rotate(150deg) skewY(-60deg)",
                transformOrigin: "0% 100%",
              }}
              className="bg-green-600 overflow-hidden		 absolute top-0 right-0 w-1/2 h-1/2"
            >
              <div
                className=" absolute p-5	cursor-pointer text-center"
                style={{
                  left: "-100%",
                  width: "200%",
                  height: "200%",
                  transform: "skewY(60deg) rotate(15deg)",
                }}
              >
                6
              </div>
            </li>
            <li
              style={{
                transform: "rotate(180deg) skewY(-60deg)",
                transformOrigin: "0% 100%",
              }}
              className="bg-gray-900 overflow-hidden 		absolute top-0 right-0 w-1/2 h-1/2"
            >
              <div
                className="absolute p-5	cursor-pointer text-center"
                style={{
                  left: "-100%",
                  width: "200%",
                  height: "200%",
                  transform: "skewY(60deg) rotate(15deg)",
                }}
              >
                7
              </div>
            </li>
            <li
              style={{
                transform: "rotate(210deg) skewY(-60deg)",
                transformOrigin: "0% 100%",
              }}
              className="bg-red-900	 overflow-hidden 		absolute top-0 right-0 w-1/2 h-1/2"
            >
              <div
                className=" absolute p-5	cursor-pointer text-center"
                style={{
                  left: "-100%",
                  width: "200%",
                  height: "200%",
                  transform: "skewY(60deg) rotate(15deg)",
                }}
              >
                8
              </div>
            </li>
            <li
              style={{
                transform: "rotate(240deg) skewY(-60deg)",
                transformOrigin: "0% 100%",
              }}
              className="bg-yellow-900	 overflow-hidden 	absolute top-0 right-0 w-1/2 h-1/2"
            >
              <div
                className=" absolute p-5	cursor-pointer	 text-center"
                style={{
                  left: "-100%",
                  width: "200%",
                  height: "200%",
                  transform: "skewY(60deg) rotate(15deg)",
                }}
              >
                9
              </div>
            </li>
            <li
              style={{
                transform: "rotate(270deg) skewY(-60deg)",
                transformOrigin: "0% 100%",
              }}
              className="bg-green-900	 overflow-hidden 		absolute top-0 right-0 w-1/2 h-1/2"
            >
              <div
                className=" absolute p-5	cursor-pointer text-center"
                style={{
                  left: "-100%",
                  width: "200%",
                  height: "200%",
                  transform: "skewY(60deg) rotate(15deg)",
                }}
              >
                10
              </div>
            </li>
            <li
              style={{
                transform: "rotate(300deg) skewY(-60deg)",
                transformOrigin: "0% 100%",
              }}
              className="bg-blue-900 overflow-hidden 		absolute top-0 right-0 w-1/2 h-1/2"
            >
              <div
                className="absolute p-5	cursor-pointer text-center"
                style={{
                  left: "-100%",
                  width: "200%",
                  height: "200%",
                  transform: "skewY(60deg) rotate(15deg)",
                }}
              >
                11
              </div>
            </li>
            <li
              style={{
                transform: "rotate(330deg) skewY(-60deg)",
                transformOrigin: "0% 100%",
              }}
              className="bg-purple-900 	overflow-hidden 		absolute top-0 right-0 w-1/2 h-1/2"
            >
              <div
                className=" absolute p-5 block cursor-pointer text-center"
                style={{
                  left: "-100%",
                  width: "200%",
                  height: "200%",
                  transform: "skewY(60deg) rotate(15deg)",
                }}
              >
                12
              </div>
            </li>
          </ul>
        </div>
      </div>
    </InfoCard>
  );
}

export default WheelOfFortune;
