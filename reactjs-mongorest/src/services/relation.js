import { removeKeyObjectEmpty } from '@/helpers/removeKeyObjectEmpty';
import { getPrefixAPI } from '@/helpers/getPrefixAPI';
import { api } from './api';

export const relationAPI = (locale) => {
  const prefix = getPrefixAPI(locale);

  const getRelations = ({ url, ...params }) => {
    return api.get(prefix + url, {
      params: { ...removeKeyObjectEmpty({ ...params }) },
    });
  };

  const newRelation = ({ data, url }) => {
    return api.post(prefix + url, data);
  };

  return { getRelations, newRelation };
};
