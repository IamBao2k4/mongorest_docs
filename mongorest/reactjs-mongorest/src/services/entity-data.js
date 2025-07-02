import { getPrefixAPI } from '@/helpers/getPrefixAPI';
import { api } from './api';

export const entityDataApi = (locale) => {
  const prefix = getPrefixAPI(locale);

  const getData = ({ entity, params }) => {
    const url = `${prefix}${entity}`;
    return api.get(url, { params });
  };

  const deleteData = ({ entity, ids }) => {
    const url = `${prefix}${entity}`;
    return api.delete(url, { params: { ids } });
  };

  const createData = ({ entity, data }) => {
    const url = `${prefix}${entity}`;
    return api.post(url, data);
  };

  // const getDetail = ({ entity, id, data }) => {
  //   const url = `${prefix}${entity}/${id}`;
  //   return api.get(url, data);
  // };
  const getDetail = async ({ entity, id, options }) => {
    const url = `${prefix}${entity}/${id}`;
    try {
      const response = await api.get(url, options);
      return response;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Đảm bảo bắt lỗi để xử lý nếu có
    }
  };

  const updateData = ({ entity, id, data }) => {
    const url = `${prefix}${entity}/${id}`;
    return api.put(url, data);
  };

  const updateMultiData = ({ entity, data }) => {
    const url = `${prefix}${entity}/many`;
    return api.put(url, data);
  };

  const getTree = ({ entity, params }) => {
    const url = `${prefix}common-parent/${entity}/get-childs-tree`;
    return api.get(url, { params });
  };

  return {
    getData,
    deleteData,
    createData,
    updateData,
    getDetail,
    updateMultiData,
    getTree,
  };
};
