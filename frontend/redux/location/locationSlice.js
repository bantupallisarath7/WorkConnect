import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  city: "Hyderabad",
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setCity: (state, action) => {
      state.city = action.payload;
    },
  },
});

export const { setCity } = locationSlice.actions;
export default locationSlice.reducer;