import { createSlice } from "@reduxjs/toolkit";
import { getCookie } from "../../helpers/sparkyConversationState";

const STATE_KEY = 'user_info'
export const user_info = createSlice({
  name:STATE_KEY,
  initialState: {
    user: null,
  },
  reducers: {
    set_user_info(state, action) {
      state.user = action.payload;
    },
  },
});

// export const SetClientCookie = (id)=>{
//   return async(dispatch, getState)=>{
//      const botId = getState().config.botId
//      const response =  await getCookie(id,botId);
//      console.log("User id: ", response.data.id)
//      dispatch(setUserId( response.data.id))

   
//   }
// }

export const { set_user_info } = user_info.actions;

export const user_info_selector = (state:any) => state[STATE_KEY];

export default user_info.reducer;