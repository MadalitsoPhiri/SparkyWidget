import { FC } from "react";
import { Advert, Feature } from "./Carousel";

interface Props {
    item: Advert
}

export const AdCard: FC<Props> = ({ item }) => {
    return (
        <div className="flex flex-col rounded-[5px] shadow-md border-[0.3px] bg-white">
            <div className="flex items-center justify-around py-4 border-b "></div>
            <div className="p-4 flex flex-col">
                <div className="flex justify-between">
                    <div>
                        <p className="font-bold text-[16px]">{item?.headline}</p>
                    </div>
                    <div className="w-[70px] h-12 rounded-md overflow-hidden flex-none">
                        <img src={item?.image} className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
            {item?.features?.map((feature: Feature) => (
                <div className="flex my-1" key={feature._id}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className=" flex-none mx-2 h-6 w-6 text-btnColor"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}>
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    <span className="text-[14px]">{feature?.title}</span>
                </div>
            ))}
            {item?.buttonLabel !== '' && (
                <div className="p-4 w-full mt-auto">
                    <button
                        onClick={() => {
                            window.open(item?.outsideUrl, '_blank')
                        }}
                        className={`bg-btnColor rounded-[6px] flex flex-row justify-center items-center px-[28px] py-[10px] my-1 w-full`}>
                        <p
                            className={`text-white ml-[12px] font-semibold text-[16px] leading-[20px]`}>
                            {item?.buttonLabel}
                        </p>
                    </button>
                </div>
            )}
        </div>
    );
};
