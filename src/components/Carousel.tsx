import { useEffect } from "react";
import { AdCard } from "./AdCard";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@store";
import { get_adverts, offersSelector } from "../store/slices/offersSlice";

export type Feature = {
  _id: string;
  title: string;
};

export type Advert = {
  _id: string;
  headline: string;
  description: string;
  image: string;
  buttonLabel: string;
  outsideUrl: string;
  features: Feature[];
};

const Carousel = () => {
  const { advert } = useSelector(offersSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(get_adverts());
  }, []);

  return (
    <div className="flex flex-col py-4 z-100 w-full">
      {advert?.advert?.length !== 0 ? (
        <div className="px-[16px]">
          <div className="bg-white flex flex-col rounded-[6px] justify-center items-start p-4">
            <span className="font-semibold mb-2  text-[16px] leading-[24px]">
              Our top picks for you
            </span>
            <span className="text-btnColor mb-2 text-[14px]">
              Advertiser Disclosure
            </span>
          </div>
        </div>
      ) : (
        ""
      )}
      <div
        className={`${
          advert?.advert?.length === 1 ? "items-center justify-center" : ""
        } w-full flex flex-row  w-full h-full overflow-x-auto   scroll-smooth py-4 px-[16px] advertise_scroll`}
      >
        {advert?.advert?.map((item: Advert, index: number) => {
          return (
            <div
              className={`${
                index === advert?.advert?.length - 1 ? "mr-0" : "mr-4"
              } flex-none w-[85%]`}
              key={index}
            >
              <AdCard item={item} />
            </div>
          );
        })}
      </div>
      {/* <div className="bg-white flex flex-col rounded-[6px] justify-center items-start p-4">
        <span className='font-semibold mb-2  text-[16px] leading-[24px]'>
          Our top picks for you
        </span>
        <span className="text-btnColor mb-2 text-[14px]">
          Advertiser Disclosure
        </span>
      </div>

      <div className="flex flex-row w-full h-full overflow-x-auto   scroll-smooth py-4">
        {advert?.advert.map((item: Advert) => {
          return (
            <div className={`flex-none mr-4 ${advert?.advert.length > 0 ? 'w-[85%]' : ' w-full'}`} key={item._id}>
              <AdCard item={item} />
            </div>
          );
        })}
      </div> */}
    </div>
  );
};
export default Carousel;
