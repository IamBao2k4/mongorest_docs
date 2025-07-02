import { getPrefixAPI } from '@/helpers/getPrefixAPI';
import { api } from './api';

export const categoriesApi = (locale) => {
  const prefix = getPrefixAPI(locale);
  const prefixFront = getPrefixAPI(locale, true);

  const getCategoryListTable = ({ params }) => {
    const url = prefix + 'categories';
    return api.get(url, { params });
  };

  const getCategoryList = ({ postTypeId, params }) => {
    const url = prefix + 'categories/get-position/' + postTypeId;
    return api.get(url, { params });
  };

  const getCategoryListByPosttype = ({ posttype, params }) => {
    const url = prefix + 'post/' + posttype + '/categories';
    return api.get(url, { params });
  };

  const getDetailCategory = ({ posttype, id }) => {
    const url = prefix + 'post/' + posttype + '/categories/' + id;
    return api.get(url);
  };

  const addCategories = ({ posttype, data }) => {
    const url = prefix + 'post/' + posttype + '/categories';
    return api.post(url, data);
  };

  const updateCategories = ({ posttype, data, id }) => {
    const url = prefix + 'post/' + posttype + '/categories/' + id;
    return api.put(url, data);
  };

  const updateCategoriesTree = ({ data, posttype }) => {
    const url = prefix + 'post/' + posttype + '/categories/update-position';
    return api.put(url, data);
  };

  const deleteCategories = ({ id, posttype }) => {
    const url = prefix + 'post/' + posttype + '/categories/' + id;
    return api.delete(url);
  };

  const deleteFolder = ({ id, params }) => {
    const url = prefix + 'categories/' + id;
    return api.delete(url, { params });
  };

  const deleteMoreCategories = ({ ids, posttype }) => {
    const url = prefix + 'post/' + posttype + '/categories';
    return api.delete(url, { params: { ids } });
  };

  const getPinnedPostsOnly = ({ posttype }) => {
    const url = prefixFront + 'categories/' + posttype + '/pinned-posts';
    return api.get(url);
  };

  return {
    getCategoryListTable,
    getCategoryListByPosttype,
    getCategoryList,
    addCategories,
    getDetailCategory,
    updateCategories,
    updateCategoriesTree,
    deleteCategories,
    deleteMoreCategories,
    getPinnedPostsOnly,
    deleteFolder,
  };
};
