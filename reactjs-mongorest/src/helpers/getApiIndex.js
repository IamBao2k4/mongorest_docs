import { entityApi, entityDataApi, groupFieldsApi, mediaApi } from '../services';

export function getApiIndex(entity, locale, jsonSchema) {
  switch (entity) {
    case 'entity':
      const { getEntity, deleteEntity } = entityApi(locale);
      return [getEntity, deleteEntity];
    case 'all-entity':
      const { getEntityAll, deleteEntity: deleteEntityAll } = entityApi(locale);
      return [getEntityAll, deleteEntityAll];
    case 'group-field':
      const { getGroupFields, deleteGroupFields } = groupFieldsApi(locale);
      return [getGroupFields, deleteGroupFields];
    case 'media':
      const { getMediaList, deleteMedia } = mediaApi(locale);
      return [getMediaList, deleteMedia];
    default:
      const { getData, deleteData } = entityDataApi(locale);
      // jsonSchema[entity]._id
      const _entity = jsonSchema?.[entity]?.type === 'post-type' ? 'post-type-content' : entity;
      return [
        (params) => {
          const _params = params?.params || {};
          if (jsonSchema?.[entity]?.type === 'post-type') {
            _params['search[post_type:in]'] = jsonSchema?.[entity]?._id;
          }
          return getData({
            ...params,
            params: _params,
            entity: _entity,
          });
        },
        (params) => {
          return deleteData({
            ...params,
            entity: _entity,
          });
        },
      ];
  }
}
