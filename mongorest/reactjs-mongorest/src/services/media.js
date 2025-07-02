import { getPrefixAPI } from '@/helpers/getPrefixAPI';
import { api } from './api';

export const mediaApi = (locale) => {
  const prefix = getPrefixAPI(locale);

  const getMediaList = ({ params }) => {
    const url = prefix + 'media';
    if ('search[folder:in]' in params) {
      params['search[categories.id:in]'] = params['search[folder:in]'];
      delete params['search[folder:in]'];
    }
    return api.get(url, { params });
  };

  const getMediaDetail = ({ id }) => {
    const url = prefix + 'media/' + id;
    return api.get(url);
  };

  const createMedia = ({ data, formData }) => {
    let form = formData || new FormData();
    if (data?.length > 0 && !formData) {
      data.map((item, index) => {
        const file = new File([item?.file], item?.title?.slice(0, 125), {
          type: item?.file?.type,
        });

        form.append(`media[${index}][title]`, item?.title?.slice(0, 125));
        form.append(`media[${index}][alt]`, item?.alt?.slice(0, 125));
        form.append(`media[${index}][file]`, file);
        if (item?.categories) {
          form.append(
            `media[${index}][categories][]`,
            item?.categories ? `${item?.categories}` : ''
          );
        }
      });
    }

    const url = prefix + 'media';
    return api.post(url, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const updateMedia = ({ id, data }) => {
    const url = prefix + 'media/' + id;
    return api.put(url, data);
  };

  const deleteMedia = ({ ids }) => {
    const url = prefix + 'media';
    return api.delete(url, { params: { ids } });
  };

  const addBulksMedia = ({ data }) => {
    const url = prefix + 'media/add-bulks';
    return api.post(url, data);
  };

  return {
    getMediaList,
    getMediaDetail,
    createMedia,
    updateMedia,
    deleteMedia,
    addBulksMedia,
  };
};
