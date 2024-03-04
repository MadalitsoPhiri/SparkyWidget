import { ATTACHMENT_TYPE } from "@constants";
import { FC } from "react";

interface ImageAttachmentsProps {
  msg: any;
}
export const ImageAttachments: FC<ImageAttachmentsProps> = ({ msg }) => {
  return (
    <>
      {" "}
      {msg?.attachments?.filter(
        (attachment: any) => attachment.type === ATTACHMENT_TYPE.IMAGE
      ).length > 0 && (
        <div
          className={`rounded-md  mt-4 ${msg.attachments.filter(
            (attachment: any) => attachment.type === ATTACHMENT_TYPE.IMAGE
          ).length === 1?'':'grid'} ${
            msg.attachments.filter(
              (attachment: any) => attachment.type === ATTACHMENT_TYPE.IMAGE
            ).length > 1
              ? "gap-2"
              : ""
          }  grid-container--fit w-full`}
        >
          {msg.attachments
            .filter(
              (attachment: any) => attachment.type === ATTACHMENT_TYPE.IMAGE
            )
            .map((attachment: any, index: number) => {
              if (
                msg.attachments.filter(
                  (attachment: any) => attachment.type === ATTACHMENT_TYPE.IMAGE
                ).length === 1
              ) {
                return (
                  <div
                    key={index}
                    className="rounded-lg  w-[100%] h-[100%] bg-black overflow-hidden"
                  >
                    <img
                      src={attachment.attachment_url}
                      className="w-[100%] h-[100%]"
                    />
                  </div>
                );
              } else {
                return (
                  <div
                    key={index}
                    className="rounded-lg  w-[100%] h-[100%] bg-black overflow-hidden"
                  >
                    <img
                      src={attachment.attachment_url}
                      className="w-full h-full object-contain"
                    />
                  </div>
                );
              }
            })}
        </div>
      )}
    </>
  );
};
