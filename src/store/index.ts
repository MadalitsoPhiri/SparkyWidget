import { configureStore } from "@reduxjs/toolkit";
import ConversationSlice from "./slices/conversations_slice";
import userInfoReducers from "./slices/userInfoSlice";
import configReducers from "./slices/configSlice";
import AuthReducer from "./slices/auth_slice";
import offersReducer from "./slices/offersSlice";
import { useDispatch } from "react-redux";

export const store = configureStore({
  reducer: {
    conversations: ConversationSlice,
    user_info: userInfoReducers,
    config: configReducers,
    auth: AuthReducer,
    offers: offersReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
