import { getPrefixAPI } from '@/helpers/getPrefixAPI';
import { api } from './api';

export const formApi = (locale) => {
  const prefix = getPrefixAPI(locale);

  const getForms = ({ params }) => {
    const url = prefix + 'form-builder';
    return api.get(url, { params });
  };

  const getForm = ({ id }) => {
    const url = prefix + 'form-builder/' + id;
    return api.get(url);
  };

  const getFormNoti = ({ id }) => {
    const url = prefix + 'form-builder/' + id + '/notification';
    return api.get(url);
  };

  const getFormReply = ({ id }) => {
    const url = prefix + 'form-builder/' + id + '/reply';
    return api.get(url);
  };

  const getFormTerms = ({ params, formId }) => {
    const url = prefix + 'form-builder/' + formId + '/terms';
    return api.get(url, { params });
  };

  const getElementsForm = ({ id }) => {
    const url = prefix + 'form-builder/' + id + '/elements';
    return api.get(url);
  };

  const getListTemplateForm = ({ id }) => {
    const url = prefix + 'form-builder/' + id + '/template-mail';
    return api.get(url);
  };

  const addForm = ({ data }) => {
    const url = prefix + 'form-builder';
    return api.post(url, data);
  };

  const addFormNoti = ({ data, id }) => {
    const url = prefix + 'form-builder/' + id + '/notification';
    return api.post(url, data);
  };

  const addFormReply = ({ data, id }) => {
    const url = prefix + 'form-builder/' + id + '/reply';
    return api.post(url, data);
  };

  const updateForm = ({ data, id }) => {
    const url = prefix + 'form-builder/' + id;
    return api.put(url, data);
  };

  const deleteForm = ({ ids }) => {
    const url = prefix + 'form-builder';
    return api.delete(url, { params: { ids } });
  };

  return {
    getForms,
    addForm,
    deleteForm,
    updateForm,
    getForm,
    getFormNoti,
    addFormNoti,
    getFormReply,
    addFormReply,
    getFormTerms,
    getListTemplateForm,
    getElementsForm,
  };
};
