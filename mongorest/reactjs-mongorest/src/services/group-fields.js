import { getPrefixAPI } from '@/helpers/getPrefixAPI';
import { api } from './api';

export const groupFieldsApi = () => {
  const prefix = getPrefixAPI();

  const getGroupFields = ({ params }) => {
    const url = prefix + 'group-field';
    return api.get(url, { params });
  };

  const getGroupFieldById = ({ id }) => {
    const url = prefix + 'group-field/' + id;
    return api.get(url);
  };

  const createGroupFields = ({ data }) => {
    const url = prefix + 'group-field';
    return api.post(url, data);
  };

  const updateGroupFields = ({ data, id }) => {
    const url = prefix + 'group-field/' + id;
    return api.put(url, data);
  };

  const deleteGroupFields = ({ ids, forceDelete = true }) => {
    const url = prefix + 'group-field';
    return api.delete(url, { params: { ids, forceDelete } });
  };

  const getLocations = () => {
    const url = prefix + 'group-field/locations';
    return api.get(url);
  };

  return {
    createGroupFields,
    getGroupFields,
    getGroupFieldById,
    updateGroupFields,
    deleteGroupFields,
    getLocations,
  };
};
