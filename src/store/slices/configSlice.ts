import { createSlice } from "@reduxjs/toolkit";

const STATE_KEY = "config";
export const config_slice = createSlice({
  name: STATE_KEY,
  initialState: {
    value: null,
    bot_id: null,
    host_dimens: {
      width: null,
      height: null,
    },
  },
  reducers: {
    add_config: (state, action) => {
      state.value = action.payload;
    },
    add_bot_id: (state, action) => {
      state.bot_id = action.payload;
    },
    update_host_dimens: (state, action) => {
      if (action.payload) {
        action.payload.height = action.payload.height
          ? (state.host_dimens.height = action.payload.height)
          : undefined;
        action.payload.width
          ? (state.host_dimens.width = action.payload.width)
          : undefined;
      }
    },
  },
});

export const config_selector = (state: any) => state[STATE_KEY];
export const { add_config, add_bot_id, update_host_dimens } = config_slice.actions;
export default config_slice.reducer;
