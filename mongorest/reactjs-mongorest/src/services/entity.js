import { getPrefixAPI } from '@/helpers/getPrefixAPI';
import { api } from './api';

export const entityApi = () => {
  const prefix = getPrefixAPI();

  const getEntity = ({ params }) => {
    const url = prefix + 'entity';
    return api.get(url, { params });
  };

  const getEntityAll = ({ params }) => {
    const url = prefix + 'entity/collections';
    return api.get(url, { params });
  };

  const getAllPosts = ({ params }) => {
    const url = prefix + 'entity';
    return api.get(url, { params });
  };

  const getEntityDetail = ({ data, id }) => {
    const url = prefix + 'entity/' + id;
    return api.get(url, data);
  };

  const createEntity = ({ data }) => {
    const url = prefix + 'entity';
    return api.post(url, data);
  };

  const updateEntity = ({ data, id }) => {
    const url = prefix + 'entity/' + id;
    return api.put(url, data);
  };

  const deleteEntity = ({ ids, forceDelete = false }) => {
    const url = prefix + 'entity';
    return api.delete(url, { params: { ids, forceDelete } });
  };

  return {
    getEntity,
    createEntity,
    updateEntity,
    getEntity,
    getEntityDetail,
    deleteEntity,
    getAllPosts,
    getEntityAll,
  };
};
