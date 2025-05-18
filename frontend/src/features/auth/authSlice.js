import { createSlice } from '@reduxjs/toolkit';
import { authApi } from './authApi';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle login
    builder.addMatcher(
      (action) => action.type.endsWith('/pending') && action.type.includes('login'),
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    
    builder.addMatcher(
      (action) => action.type.endsWith('/fulfilled') && action.type.includes('login'),
      (state, { payload }) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = payload.user;
        state.token = payload.token;
        localStorage.setItem('token', payload.token);
      }
    );
    
    builder.addMatcher(
      (action) => action.type.endsWith('/rejected') && action.type.includes('login'),
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      }
    );
    
    // Handle register
    builder.addMatcher(
      (action) => action.type.endsWith('/pending') && action.type.includes('register'),
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    
    builder.addMatcher(
      (action) => action.type.endsWith('/fulfilled') && action.type.includes('register'),
      (state, { payload }) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = payload.user;
        state.token = payload.token;
        localStorage.setItem('token', payload.token);
      }
    );
    
    builder.addMatcher(
      (action) => action.type.endsWith('/rejected') && action.type.includes('register'),
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      }
    );
  },
});

export const { logout, setCredentials, clearError } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;
