import { SOCKET_EVENT_NAME, UPLOAD_STATUS } from "@constants";
import { useAppDispatch } from "@store";
import { AnimatePresence, motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import useSound from "use-sound";
import Notification from "./assets/sounds/notification-sound.mp3";
import AllConversations from "./components/AllConversations";
import AllQuestions from "./components/AllQuestions";
import ChatArea from "./components/ChatArea";
import Home from "./components/Home";
import { get_user_info } from "./helpers/userDetails";
import UploadWorker from "./services/workers/upload.worker?worker";
import {
  auth_selector,
  connect_socket,
  retry_socket_connection,
  set_user_id,
  set_widget_info,
} from "./store/slices/auth_slice";
import { add_config, update_host_dimens } from "./store/slices/configSlice";
import {
  add_message,
  conversation_slice_selector,
  dequeueUpload,
  set_play_notification,
  set_read_receipts,
  updateFileAttachmentState,
  updateUploadProgress,
  updateUploadState,
  update_typing_status,
} from "./store/slices/conversations_slice";

import { useDimensions } from "./hooks/useDimensions";


import { pickHeaderTextcolor, pickTextColorBasedOnBgColorAdvanced } from "./helpers/utilityFunctions";
import { set_user_info } from "./store/slices/userInfoSlice";
export interface AppProps {
  widgetId: string;
  origin: string;
}
const App: FC<AppProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClickAble, setisClickAble] = useState(true);
  const [timeout, setTimeoutState] = useState<any>(null);
  const dispatch = useAppDispatch();
  const { socket, user_id } = useSelector(auth_selector);
  const { upload_state, upload_queue, play_notification } = useSelector(
    conversation_slice_selector
  );
  const config = useSelector((state: any) => state.config.value);
  const { isMobile } = useDimensions();
  //@ts-ignore
  const [playActive, { isPlaying }] = useSound(Notification, {
    volume: 0.1,
  });

  useEffect(() => {
    if (play_notification && !isPlaying) {
      playActive();
      dispatch(set_play_notification(false));
    }
  }, [play_notification]);
  const [worker, setWorker] = useState(new UploadWorker());
  const onMessageHandler = (payload: any) => {
    const parsed_payload = JSON.parse(payload.data);
    if (parsed_payload.event_name === "upload_progress") {
      dispatch(
        updateUploadProgress({
          progress: parsed_payload.progress,
          file_id: parsed_payload.id,
        })
      );
    } else if (parsed_payload.event_name === "upload_complete") {
      dispatch(
        updateUploadState({
          progress: 0,
          uploading: false,
          file_id: null,
          cancel_upload: false,
        })
      );
      worker.terminate();
      setWorker(new UploadWorker());
      dispatch(
        updateFileAttachmentState({
          file_id: parsed_payload.file_id,
          url: parsed_payload.data.url,
          status: UPLOAD_STATUS.COMPLETED,
        })
      );
    } else if (parsed_payload.event_name === "refreshed_token") {
      // dispatch(requestRefreshTokenSuccessThunK(parsed_payload.response));
    }
  };
  const onErrorHandler = (err: any) => console.log("error", err);
  const runQueue = async () => {
    if (upload_queue.length && !upload_state.uploading) {
      const temp_file = upload_queue[0];
      dispatch(
        updateUploadState({
          file: temp_file,
          progress: 0,
          uploading: true,
          file_id: temp_file.id,
          cancel_upload: upload_state.cancel_upload,
        })
      );

      worker.postMessage({
        event_name: "file_upload",
        file: [temp_file],
        userId: user_id,
        origin: props.origin,
        widgetId: props.widgetId,
        file_id: temp_file.id,
      });
      console.log("starting new worker", {
        event_name: "file_upload",
        file: [temp_file],
        userId: user_id,
        origin: props.origin,
        widgetId: props.widgetId,
        file_id: temp_file.id,
      });

      dispatch(dequeueUpload());
    }
  };
  useEffect(() => {
    runQueue();
  }, [upload_queue, worker]);

  useEffect(() => {
    if (worker) {
      worker.removeEventListener("message", onMessageHandler);
      worker.removeEventListener("error", onErrorHandler);
      worker.addEventListener("error", onErrorHandler);
      worker.addEventListener("message", onMessageHandler);
    }

    return () => {
      worker.removeEventListener("message", onMessageHandler);
      worker.removeEventListener("error", onErrorHandler);
    };
  }, [worker]);
  useEffect(() => {
    if (worker && upload_state.cancel_upload) {
      worker.terminate();
      setWorker(new UploadWorker());
      dispatch(
        updateUploadState({
          file: null,
          progress: 0,
          uploading: false,
          file_id: null,
          cancel_upload: false,
        })
      );
    }
  }, [upload_state.cancel_upload]);

  useEffect(() => {
    dispatch(set_widget_info(props));
    parent.postMessage({ event_name: "on_mount" }, "*");
    parent.postMessage({ event_name: "get_cookie" }, "*");
  }, []);
  useEffect(() => {
    console.log("config", config);
    if (config) {
      document.documentElement.style.setProperty(
        "--header-bg-color",
        config.colors.header_bg_color
      );
      document.documentElement.style.setProperty(
        "--header-text-color",
        config.colors.header_text_color
      );
      document.documentElement.style.setProperty(
        "--header-text-color-actual",
        pickHeaderTextcolor(
          config.colors.header_text_color,
          config.colors.header_bg_color,
          "#FFFFFF",
          "#000000"
        )
      );
      document.documentElement.style.setProperty(
        "--border-color",
        config.colors.border_color
      );
      document.documentElement.style.setProperty(
        "--btn-color",
        config.colors.btn_color
      );
      document.documentElement.style.setProperty(
        "--btn-txt-color",
        config.colors.btn_text_color
      );
      document.documentElement.style.setProperty(
        "--main-hover-color",
        `${config.colors.header_bg_color}20`
      );
      document.documentElement.style.setProperty(
        "--chevron-color",
        pickTextColorBasedOnBgColorAdvanced(
          config.colors.header_bg_color,
          "#FFFFFF",
          "#000000"
        )
      );
      document.documentElement.style.setProperty(
        "--btn-text-color",
        pickTextColorBasedOnBgColorAdvanced(
          config.colors.btn_color,
          "#FFFFFF",
          "#000000"
        )
      );

      document.documentElement.style.setProperty(
        "--chat-options-text-color",
        pickTextColorBasedOnBgColorAdvanced(
          config.colors.header_bg_color,
          config.colors.header_bg_color,
          "#000000"
        )
      );
    }
  }, [config]);

  useEffect(() => {
    get_user_info()
      .then((data) => {
        dispatch(set_user_info(data));
      })
      .catch((e) => console.error(e.message));
    window.addEventListener("message", (event: any) => {
      if (event.data.hasOwnProperty("event_name")) {
        if (event.data.event_name == "resize") {
          // do somerhing here
          dispatch(
            update_host_dimens({
              width: event.data.width,
              height: event.data.height,
            })
          );
        } else if (event.data.event_name == "on_cookie") {
          console.log("on_cookie", event.data);
          if (event?.data?.cookie) {
            dispatch(set_user_id(event.data.cookie));
          }
          dispatch(connect_socket());
        }
      }
    });

    return () => {
      window.removeEventListener("message", () => {});
    };
  }, []);

  useEffect(() => {
    socket?.on("connect", async () => {
      console.log("I connected");
      console.log("readystate", socket.io._readyState);

      try {
        const result = await get_user_info();
        socket.emit(
          "set_user_info",
          { event_name: "set_user_info", data: result },
          (response: any) => {
            dispatch(set_user_info(response.data));
          }
        );
      } catch (e) {
        console.log("error geting user details", e);
      }

      socket.emit(
        SOCKET_EVENT_NAME.GET_CONFIG,
        {
          event_name: SOCKET_EVENT_NAME.GET_CONFIG,
          data: { widget_id: props.widgetId },
          weird: true,
        },
        (response: any) => {
          if (response) {
            if (response.config) {
              dispatch(add_config(response.config));
            }
          }
        }
      );
    });

    socket?.on("connect_error", (err: any) => {
      if (err.message === "Forbidden") {
        parent.postMessage({ event_name: "forbidden_connect_error" }, "*");
        console.log("failed to connect", err.message);
      } else if (err.message === "no_cookie") {
        socket?.disconnect();
        console.log("no cookie available");

        dispatch(retry_socket_connection() as any);
      } else if (err.message === "user_not_found") {
        socket?.disconnect();
        console.log("user not found!");

        dispatch(retry_socket_connection() as any);
      }
    });

    socket?.on("typing_status", (payload: any) => {
      dispatch(update_typing_status(payload));
    });
    socket?.on("read_receipts", (response: any) => {
      dispatch(set_read_receipts(response.data));
    });
    socket?.on("new_message", (msg: any) => {
      if (msg.data) {
        dispatch(
          add_message({
            conversation_id: msg.data.conversation._id,
            msg: msg.data,
            conversation: msg.data.conversation,
          })
        );
        dispatch(set_play_notification(true));
      }
    });

    socket?.on("auth_error", (msg: any) => {
      console.log("auth_error:", msg);
    });
  }, [socket]);
  const sendCloseSignal = () => {
    parent.postMessage(
      { event_name: "widget_close_status", status: isOpen },
      "*"
    );
    setisClickAble(true);
  };
  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setTimeoutState(setTimeout(sendCloseSignal, 500));
      setisClickAble(false);
    } else {
      sendCloseSignal();
    }
  };
  return config != null ? (
    <MemoryRouter initialIndex={1}>
      <div className="fixed -bottom-0 right-0 w-full h-full  flex flex-col items-end  justify-end sm:p-[20px] sm:min-h-[400px] overflow-y-hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              animate={{ y: 0, opacity: 1 }}
              initial={{ y: 50, opacity: 0 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "tween" }}
              className={`relative rounded-[8px] flex flex-1 border border-gray-100 shadow-md ${
                isMobile ? "" : "mb-[20px]"
              }  ${
                isMobile ? "w-full h-full" : "w-[384px]"
              } overflow-y-hidden z-10 `}
            >
              {isMobile && (
                <div
                  onClick={handleOpen}
                  className="p-[8px] rounded-[8px] fixed right-[24px] top-[20px] sm:hidden flex flex-col justify-center items-center cursor-pointer z-50"
                >
                  <div className="rounded-[8px] absolute bg-black opacity-30 w-full h-full"></div>
                  <svg
                    className="w-[24px] h-[24px] text-white z-10"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              )}
              <AnimatePresence>
                <Routes>
                  <Route path="/" element={<Home />} />

                  <Route path="/chat" element={<ChatArea />} />

                  <Route path="/chat/:conversation_id" element={<ChatArea />} />

                  <Route
                    path="/allQuestions"
                    element={<AllQuestions widget_id={props.widgetId} />}
                  />
                  <Route
                    path="/allConversations"
                    element={<AllConversations />}
                  />
                </Routes>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className={`bg-headerBgColor  ${
            isMobile ? "bottom-[20px] right-[20px]" : "-bottom-0 right-0"
          }  sm:m-0 ${
            isClickAble ? "cursor-pointer" : "pointer-events-none"
          } rounded-full flex ${
            isMobile ? "absolute" : "static"
          }  w-[60px] h-[60px] flex-shrink-0  flex-col justify-center items-center`}
          onClick={handleOpen}
        >
          {isOpen && (
            <svg
              className={`w-[32px] h-[32px] text-chevronColor`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          )}

          {!isOpen && (
            <svg
              className={`w-[32px] h-[32px] bg-headerBgColor `}
              viewBox="0 0 26 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.2994 20.3057C21.0032 19.5221 20.3177 18.0303 18.8248 16.731C16.4267 14.6445 13.6769 14.5607 12.9511 14.563C11.8416 14.5654 9.80116 14.7755 7.82454 16.181C5.74262 17.6621 4.92597 19.6224 4.66168 20.3517H7.93891C8.20455 19.8891 8.74966 19.083 9.72687 18.4269C11.208 17.432 12.7174 17.4308 13.2804 17.4603C15.1356 17.5595 16.3558 18.5118 16.763 18.8388C17.4121 19.3604 17.8358 19.9139 18.0919 20.3057H21.3008H21.2994Z"
                fill="currentColor"
              />
              <path
                d="M4.94136 14.105C4.94136 14.8297 4.35367 15.4174 3.63011 15.4174C3.23718 15.4174 2.88548 15.2451 2.64587 14.9713L0.535801 12.8458C0.211249 12.6063 0 12.2215 0 11.7872C0 11.0626 0.586552 10.4761 1.31116 10.4761C1.59323 10.4761 1.85527 10.5646 2.06883 10.7168L2.38045 11.0272L4.43022 13.0677L4.6628 13.299C4.83741 13.5209 4.94136 13.8006 4.94136 14.105Z"
                fill="currentColor"
              />
              <path
                d="M21.8543 24.992C21.8543 25.732 21.2535 26.3327 20.5125 26.3327H5.49603C4.75615 26.3327 4.15533 25.732 4.15533 24.992C4.15533 24.252 4.75615 23.6501 5.49603 23.6501H20.5125C21.2535 23.6501 21.8543 24.2509 21.8543 24.992Z"
                fill="currentColor"
              />
              <path
                d="M13.9141 11.1853C13.402 11.6975 12.5711 11.6975 12.0589 11.1853C11.7817 10.908 11.6542 10.5374 11.6788 10.1739L11.6895 7.17867C11.6292 6.77978 11.752 6.35846 12.0589 6.05162C12.5711 5.53943 13.4007 5.53943 13.913 6.05162C14.1125 6.25107 14.2352 6.4989 14.2787 6.75736V7.19756L14.2859 10.0901V10.4182C14.2529 10.6991 14.129 10.9693 13.9141 11.1853Z"
                fill="currentColor"
              />
              <path
                d="M22.3711 15.4174C21.6466 15.4174 21.0587 14.8297 21.0587 14.1062C21.0587 13.7132 21.2311 13.3616 21.5049 13.122L23.6303 11.0119C23.8699 10.6873 24.2546 10.4761 24.689 10.4761C25.4137 10.4761 26 11.0626 26 11.7872C26 12.0693 25.9117 12.3313 25.7593 12.5449L25.449 12.8564L23.4086 14.9064L23.1771 15.1389C22.9554 15.3135 22.6757 15.4174 22.3711 15.4174Z"
                fill="currentColor"
              />
            </svg>
          )}
        </div>
      </div>
    </MemoryRouter>
  ) : null;
};
export default App;
