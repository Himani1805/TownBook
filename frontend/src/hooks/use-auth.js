import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useGetMeQuery } from '@/features/auth/authApi';
import { setCredentials } from '@/features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  
  const { data: userData, isLoading, isSuccess, isError } = useGetMeQuery(undefined, {
    skip: !token || isAuthenticated,
  });

  useEffect(() => {
    if (isSuccess && userData) {
      dispatch(setCredentials({ user: userData, token }));
    }
  }, [isSuccess, userData, token, dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading: isLoading && !!token,
    isError,
  };
};
