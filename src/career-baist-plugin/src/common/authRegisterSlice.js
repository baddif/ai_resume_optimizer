// src/store/slices/authRegisterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: '',
  verificationSent: false,
  verificationSuccess: false,
  passwordSetupToken: '',
  setPasswordModalOpen: false,
  setPasswordModalIsCreate: false,
  passwordModalIsResetByEmail: false,
  passwordResetByEmailToken: ''
};

const authRegisterSlice = createSlice({
  name: 'authRegister',
  initialState,
  reducers: {
    setEmail(state, action) {
      state.email = action.payload;
    },
    setVerificationSent(state, action) {
      state.verificationSent = action.payload;
    },
    setVerificationSuccess(state, action) {
      state.verificationSuccess = action.payload;
    },
    resetRegisterState(state) {
      Object.assign(state, initialState);
    },
    setPasswordSetupToken(state, action) {
      state.passwordSetupToken = action.payload;
    },
    setSetPasswordModalOpen(state, action) {
      state.setPasswordModalOpen = action.payload;
    },
    setSetPasswordModalIsCreate(state, action) {
      state.setPasswordModalIsCreate = action.payload;
    },
    setPasswordModalIsResetByEmail(state, action) {
      state.passwordModalIsResetByEmail = action.payload;
    },
    setPasswordResetByEmailToken(state, action) {
      state.passwordResetByEmailToken = action.payload;
    },
  },
});

export const {
  setEmail,
  setVerificationSent,
  setVerificationSuccess,
  resetRegisterState,
  setPasswordSetupToken,
  setSetPasswordModalOpen,
  setSetPasswordModalIsCreate,
  setPasswordModalIsResetByEmail,
  setPasswordResetByEmailToken
} = authRegisterSlice.actions;

export default authRegisterSlice.reducer;
