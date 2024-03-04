import React from "react";
import ReactDOM from "react-dom/client";
import App, { AppProps } from "./App";
import "./index.css";
import { store } from "@store";
import { Provider } from "react-redux";
const start = (payload: AppProps) => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <Provider store={store}>
      <React.StrictMode>
        <App origin={payload.origin} widgetId={payload.widgetId} />
      </React.StrictMode>
    </Provider>
  );
};

window.addEventListener(
  "message",
  (event) => {
    if (event.data.hasOwnProperty("event_name")) {
      if (event.data.event_name == "onload") {
        console.log("widget id", event.data.id);
        console.log("client origin", event.data.origin);
        if (event.data.id) {
          start({widgetId:event.data.id,origin:event.data.origin});
        }
      }
    }
  },
  false
);
