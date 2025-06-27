import { getPrefixAPI } from '@/helpers/getPrefixAPI';
import { api } from './api';

export const seoApi = () => {
  const prefix = getPrefixAPI();

  const getPath = ({ path, params }) => {
    const url = `${prefix}protean/list/seo-entity?path=${path}`;
    return api.get(url, { params });
  };

  return {
    getPath,
  };
};
