import { getPrefixAPI } from '@/helpers/getPrefixAPI';
import { api } from './api';

const usersApi = () => {
  const prefix = getPrefixAPI();

  const getUsers = ({ params }) => {
    const url = prefix + 'users';
    return api.get(url, { params });
  };

  const getCurrentUser = () => {
    const url = prefix + 'auth/me';
    return api.get(url);
  };

  const getUserById = ({ id }) => {
    const url = prefix + 'users/' + id;
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

  const loginWithToken = (token) => {
    const url = prefix + 'auth/callback/check?code=' + token;
    return api.get(url);
  };

  const loginWithMicrosoft = () => {
    const url = prefix + 'auth/ms365/url';
    return api.get(url);
  };

  const createUser = ({ data }) => {
    const url = prefix + 'users';
    return api.post(url, data);
  };

  const updateUser = ({ data, id }) => {
    const url = prefix + 'users/' + id;
    return api.put(url, data);
  };

  const deleteUsers = ({ ids }) => {
    const url = prefix + 'users';
    return api.delete(url, { params: { ids } });
  };

  return {
    login,
    loginWithMicrosoft,
    logout,
    getCurrentUser,
    getUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUsers,
    loginWithToken,
  };
};

export default usersApi;
