import { entityApi } from '@/services/entity';
import { entityDataApi } from '@/services/entity-data';
import { groupFieldsApi } from '@/services/group-fields';
import { formatBlocks } from './submit';

export function convertValueToIds(data) {
  // Kiểm tra nếu data là một mảng
  if (Array.isArray(data)) {
    return data.map((item) => convertValueToIds(item));
  }

  // Nếu data có rules, đệ quy vào rules
  if (data.rules) {
    return {
      ...data,
      rules: data.rules.map((rule) => convertValueToIds(rule)),
    };
  }

  // Nếu field có "value" là một mảng, chuyển thành danh sách _id
  if (data.value && Array.isArray(data.value)) {
    const ids = data.value.map((item) => item._id).join(',');
    return {
      ...data,
      value: ids,
    };
  }

  // Trả lại object gốc nếu không cần thay đổi
  return data;
}

export async function getDataDetail({ entity, id, locale, properties, posttype }) {
  const _properties = JSON.parse(JSON.stringify(properties));

  _properties.blocks = {
    title: 'Title',
    type: 'string',
    widget: 'shortAnswer',
    objectKey: 'title',
    filter: true,
  };
  let result = null;
  switch (entity) {
    case 'entity':
      result = await entityApi(locale).getEntityDetail({ id });
      break;
    case 'group-field':
      result = await groupFieldsApi(locale).getGroupFieldById({ id });
      break;
    default:
      result = await entityDataApi(locale).getDetail({
        id,
        entity: posttype ? 'post-type-content' : entity,
      });
  }
  const _data = {};
  formatDataGet(_data, result?.data, _properties);
  if (result?.data?.conditions) {
    const _listRule = result?.data?.conditions
      ? JSON.parse(JSON.stringify(result?.data?.conditions))
      : {};
    _data.conditions = {
      ..._listRule,
      rules: _listRule?.rules ? _listRule?.rules?.filter((item) => item.key !== 'type') : [],
    };
  }

  return { data: _data };
}

export async function submitDataDetail({
  entity,
  schemaBuilder,
  id,
  data,
  locale,
  properties,
  blocks,
  posttype,
}) {
  let result = null;
  const _data = {
    locale,
    is_active: true,
    meta_data: {},
  };

  formatDataSubmit(_data, data, properties, entity);

  if (posttype) {
    let formDataPost = formatBlocks(blocks);
    if (formDataPost) {
      _data['blocks'] = formDataPost;
    }
    _data['post_type'] = [posttype];
    result = id
      ? await entityDataApi(locale).updateData({
          id,
          data: _data,
          entity: `post-type-content/${entity}`,
        })
      : await entityDataApi(locale).createData({
          data: _data,
          entity: `post-type-content/${entity}`,
        });
  } else {
    switch (entity) {
      case 'entity':
        result = id
          ? await entityApi(locale).updateEntity({
              id,
              data: {
                ..._data,
                ...(data?.languages ? { languages: data?.languages } : {}),
                json_schema: JSON.parse(schemaBuilder.json),
                ui_schema: JSON.parse(schemaBuilder.ui),
              },
            })
          : await entityApi(locale).createEntity({
              data: {
                ..._data,
                ...(data?.languages ? { languages: data?.languages } : {}),
                json_schema: JSON.parse(schemaBuilder.json),
                ui_schema: JSON.parse(schemaBuilder.ui),
              },
            });
        break;

      case 'group-field':
        result = id
          ? await groupFieldsApi(locale).updateGroupFields({
              id,
              data: {
                ..._data,
                json_schema: JSON.parse(schemaBuilder.json),
                ui_schema: JSON.parse(schemaBuilder.ui),
              },
            })
          : await groupFieldsApi(locale).createGroupFields({
              data: {
                ..._data,
                json_schema: JSON.parse(schemaBuilder.json),
                ui_schema: JSON.parse(schemaBuilder.ui),
              },
            });
        break;
      default:
        let formDataPost = formatBlocks(blocks);
        const _dataPost = {
          ..._data,
          ...(formDataPost ? { blocks: formDataPost } : {}),
          ...(schemaBuilder && schemaBuilder?.json && schemaBuilder?.ui
            ? {
                json_schema: JSON.parse(schemaBuilder.json),
                ui_schema: JSON.parse(schemaBuilder.ui),
              }
            : {}),
        };
        result = id
          ? await entityDataApi(locale).updateData({
              id,
              data: _dataPost,
              entity,
            })
          : await entityDataApi(locale).createData({ data: _dataPost, entity });
    }
  }

  return result;
}

function formatDataGet(result, data, properties) {
  Object.keys(properties).map((key) => {
    const isKeyAdvance = handleKeyAdvance({ result, data, key });
    if (isKeyAdvance) return;
    const item = properties[key];
    if (item.type === 'object') {
      if (!result?.[key]) result[key] = {};
      if (!properties[key].properties) result[key] = data[key];
      else if (data[key]) formatDataGet(result[key], data[key], properties[key].properties || {});
    } else {
      if (item.widget === 'boolean') {
        result[key] = data?.[key];
        return;
      }
      if (data[key]) {
        switch (item.widget) {
          default:
            result[key] = data[key];
        }
      }
    }
  });
}

export function formatDataSubmit(result, data, properties) {
  Object.keys(properties || {}).map((key) => {
    const item = properties[key];
    if (item.type === 'object') {
      result[key] = {};
      if (!properties[key].properties) result[key] = data[key];
      else if (data[key]) formatDataSubmit(result[key], data[key], properties[key].properties);
    } else {
      if (data[key] !== null) {
        if (key === 'builder_id') {
          const builder_id = data?.[key]?.[0]?.id || data?.[key];
          result[key] = builder_id;
          return;
        }
        if (key === 'permission') {
          const _permission = JSON.parse(JSON.stringify(data?.permission));
          const _res = [];
          Object.entries(_permission).map(([entity, filter]) => {
            _res.push({
              filter,
              entity,
            });
          });
          result.permission = _res;
          return;
        }

        switch (item.widget) {
          case 'file':
          case 'multipleFiles':
            result[key] =
              Array.isArray(data[key]) && data[key]?.length > 0
                ? data[key]?.map((item) => item._id)
                : null;
            break;
          case 'relation':
            result[key] =
              data[key]?.length > 0 ? data[key]?.map((item) => item._id || item.title) : null;
            break;
          default:
            if (key === 'conditions' && data?.conditions) {
              const _listRule = convertValueToIds(JSON.parse(JSON.stringify(data?.conditions)));
              _listRule?.rules?.push({
                key: 'type',
                operator: 'is',
                labelValue: 'Posttype',
                value: data?.post_type?.[0]?.slug,
              });
              result.conditions = _listRule;
              break;
            }
            result[key] = data[key];
        }
      }
    }
  });
}

function handleKeyAdvance({ result, data, key }) {
  if (data?.[key] === undefined) return true;

  if (key === 'permission' && data?.permission) {
    const _res = {};
    const _permission = JSON.parse(JSON.stringify(data?.permission));
    _permission?.map((item) => {
      _res[item.entity] = item.filter;
    });
    result.permission = _res;
    return true;
  }

  if (key === 'file_path' && data?.path) {
    result.file_path = data?.path;
    return true;
  }

  if (key === 'blocks' && data?.blocks) {
    result.blocks = Object.entries(data?.blocks).map(([blockName, blockForm]) => {
      return {
        [blockName?.split('___')[0]]: { ...blockForm },
      };
    });
    return true;
  }

  if (key === 'json_schema' && data?.json_schema) {
    result.schemaBuilder = {
      json: JSON.stringify(data?.json_schema) || JSON.stringify(data?.jsonschema),
      ui: JSON.stringify(data?.ui_schema) || JSON.stringify(data?.uischema),
    };
    return true;
  }

  if (key === 'jsonschemaform' && data?.jsonschemaform) {
    result.schemaBuilder = {
      json: JSON.stringify(data?.jsonschemaform?.jsonschema),
      ui: JSON.stringify(data?.jsonschemaform?.uischema),
    };
    return true;
  }

  return false;
}
