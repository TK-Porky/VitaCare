import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api';
import { useAuthStore, User } from '../store';
import { API_ENDPOINTS } from '../types/api-endpoints';
import { LoginEmailFormValues, LoginPhoneFormValues, RegisterFormValues } from '../schemas';

export const useAuth = () => {
  const { setAuth, logout } = useAuthStore();

  const loginEmailMutation = useMutation({
    mutationFn: async (values: LoginEmailFormValues) => {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, values);
      if (!response.success) throw new Error(response.error || 'Login failed');
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.refreshToken);
    },
  });

  const loginPhoneMutation = useMutation({
    mutationFn: async (values: LoginPhoneFormValues) => {
      // For phone login, it might be a two-step process (OTP)
      // This is a placeholder for the initial phone submission
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, values);
      if (!response.success) throw new Error(response.error || 'Request failed');
      return response.data;
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, values);
      if (!response.success) throw new Error(response.error || 'Registration failed');
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.refreshToken);
    },
  });

  return {
    loginEmail: loginEmailMutation.mutateAsync,
    isLoggingInEmail: loginEmailMutation.isPending,
    loginPhone: loginPhoneMutation.mutateAsync,
    isLoggingInPhone: loginPhoneMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout,
  };
};
