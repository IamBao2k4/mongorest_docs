import { getPrefixAPI } from '@/helpers/getPrefixAPI';
import { api } from './api';

export const authApi = () => {
  const prefix = getPrefixAPI();

  const getCurrentUser = () => {
    const url = prefix + 'auth/me';
    return api.get(url);
  };

  const logout = () => {
    const url = prefix + 'logout';
    return api.get(url);
  };

  const login = ({ email, password, remember_me = true }) => {
    const url = prefix + 'auth/login';
    return api.post(url, { email, password, remember_me });
  };

  const register = ({ email, username, phone, password }) => {
    const url = prefix + 'auth/register';
    return api.post(url, { email, username, phone, password });
  };

  return {
    login,
    logout,
    register,
    getCurrentUser,
  };
};
