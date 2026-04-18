import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  errorDispatch: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
    },

    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.errorDispatch = null;
    },

    signInFailure: (state, action) => {
      state.errorDispatch = action.payload;
      state.loading = false;
    },

    signOutStart: (state) => {
      state.loading = true;
    },

    signOutSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.errorDispatch = null;
    },

    signOutFailure: (state, action) => {
      state.errorDispatch = action.payload;
      state.loading = false;
    },


    updateAvailability: (state, action) => {
      if (!state.currentUser) return;

      if (!state.currentUser.availability) {
        state.currentUser.availability = {};
      }

      state.currentUser.availability.isAvailable = action.payload;
    },

    updateLocation: (state, action) => {
      if (!state.currentUser) return;

      state.currentUser.location = action.payload;
    },

    updateProfile: (state, action) => {
      if (!state.currentUser) return;

      state.currentUser = {
        ...state.currentUser,
        ...action.payload,
      };
    },
  },
});

export const {
  signInFailure,
  signInStart,
  signInSuccess,
  signOutStart,
  signOutSuccess,
  signOutFailure,

  updateAvailability,
  updateLocation,
  updateProfile,
} = authSlice.actions;

export default authSlice.reducer;