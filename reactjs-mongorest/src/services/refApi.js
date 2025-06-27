import { getPrefixAPI } from '@/helpers/getPrefixAPI';
import { api } from './api';

export const refApi = () => {
  const prefix = getPrefixAPI();
  const getList = ({ endpoint, customEndpoint, params, hasList = true }) => {
    const url = prefix + (customEndpoint || `protean/${hasList ? 'list/' : ''}${endpoint}`);
    return api.get(url, { params });
  };

  return {
    getList,
  };
};
