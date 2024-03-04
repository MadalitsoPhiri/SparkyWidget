import { ATTACHMENT_TYPE, USERTYPE } from "@constants";
import { FC } from "react";

interface FileAttachmentsProps {
  msg: any;
}
export const FileAttachments: FC<FileAttachmentsProps> = ({ msg }) => {
  return (
    <>
      {msg?.attachments?.filter(
        (attachment: any) => attachment.type === ATTACHMENT_TYPE.FILE
      ).length > 0 && (
        <div className="flex flex-col mt-4 w-[100%] gap-2">
          {msg.attachments
            .filter(
              (attachment: any) => attachment.type === ATTACHMENT_TYPE.FILE
            )
            .map((attachment: any) => {
              return (
                <a
                  href={attachment.attachment_url}
                  key={attachment.attachment_url}
                  download
                >
                  <div
                    className={`flex flex-row items-center py-1 px-2 rounded-md ${
                      msg.sender.type === USERTYPE.CLIENT
                        ? "bg-yellow-50"
                        : "bg-yellow-50"
                    }`}
                  >
                    <svg
                      className="mr-1 w-3 h-3 hover:text-primary_color text-gray-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      ></path>
                    </svg>
                    <p className="truncate text-[12px] text-[#6652A9]">
                      {attachment.attachment_name
                        ? attachment.attachment_name
                        : attachment.attachment_url}
                    </p>
                  </div>
                </a>
              );
            })}
        </div>
      )}
    </>
  );
};
