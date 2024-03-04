// @ts-nocheck
import {
  defaultDomain,
  SOCKET_EVENT_NAME,
  SOCKET_URL,
  USERTYPE,
} from "@constants";
import "@/libs/socket.io-stream";
import { io } from "socket.io-client";
import { AppProps } from "../../App";
const connectSocket = (payload: AppProps, userId: string) => {
  return io(SOCKET_URL, {
    extraHeaders: {
      Type: USERTYPE.CLIENT,
      "Widget-id": payload.widgetId,
      "Widget-host-origin": payload.origin,
      [payload.widgetId]: userId,
    },
    withCredentials: true,
  });
};

self.onmessage = (payload: MessageEvent<any>) => {
   

  const stream = ss.createStream();
   

  let blobStream = ss.createBlobReadStream(payload.data.file[0]);


  let size = 0;
  const performFileUpload = (payload: any, token = payload.data.token) => {
    const socket = connectSocket(
      {
        origin: payload.data.origin,
        widgetId: payload.data.widgetId,
      },
      payload.data.userId
    );
    socket?.on("connect", () => {
      //@ts-ignore
      ss(socket).emit(
        "file",
        stream,
        { size: payload.data.file[0].size, name: payload.data.file[0].name },
        (data: any) => {
          stream.destroy();
          blobStream = undefined;
          postMessage(
            JSON.stringify({
              event_name: "upload_complete",
              data,
              file_id: payload.data.file_id,
            })
          );
        }
      );

      blobStream.on("data", function (chunk: any) {
        size += chunk.length;

        postMessage(
          JSON.stringify({
            event_name: "upload_progress",
            progress: Math.floor((size / payload.data.file[0].size) * 100),
            id: payload.data.file_id,
          })
        );
      });

      blobStream.pipe(stream);
    });

    socket?.on("connect_error", async (err) => {
      if (err.message === "Forbidden") {
        console.log('connect error',)
        // const result = await refreshToken();
        // if (result.response) {
        //   performFileUpload(payload, result.response.data.user.access_token);
        // }
        // postMessage(
        //   JSON.stringify({
        //     event_name: "refreshed_token",
        //     response: result.response,
        //   })
        // );
      }

      return () => socket.disconnect();
    });
  };
  if (payload.data.event_name === "file_upload") {
    performFileUpload(payload);
  } else if (payload.data.event_name === "cancel_upload") {
    stream.destroy();
  }
};
