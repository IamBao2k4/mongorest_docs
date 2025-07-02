import { getPrefixAPI } from '@/helpers/getPrefixAPI';
import { api } from './api';

export const importApi = () => {
  const prefix = getPrefixAPI();

  const importPosttype = ({ data, params }) => {
    const url = `${prefix}post-type-content/upload-excel`;
    return api.post(url, data, {
      params,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  return {
    importPosttype,
  };
};
