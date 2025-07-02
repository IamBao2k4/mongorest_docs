import getComponentName from './getComponentName';

function getKeyFilter(item, group) {
  if (group) {
    return `${group}.${item}`;
  }

  if (item === 'templates') {
    return 'templates.id';
  }

  if (item === 'categories' || item === 'folder') {
    return 'categories.id';
  }

  if (item === 'channels') {
    return 'channels.id';
  }

  if (item === 'roles') {
    return 'roles.id';
  }

  if (item === 'tags') {
    return 'tags.tag_id';
  }

  if (item === 'meta_description') {
    return 'seo_tags.meta_description';
  }

  if (item === 'meta_title') {
    return 'seo_tags.meta_title';
  }

  if (item === 'menuItems') {
    return 'menuItems.name';
  }

  return item;
}

const getKey = (data, result, headerDefault, group = null) => {
  if (typeof data === 'object' && !Array.isArray(data) && 'properties' in data) {
    Object.keys(data.properties).map((item) => {
      if (
        typeof data.properties[item] === 'object' &&
        !Array.isArray(data.properties[item]) &&
        'properties' in data.properties[item]
      ) {
        getKey(data.properties[item], result, headerDefault, item);
      } else {
        if (!data.properties[item]?.filter) return;
        result.push({
          ...data.properties[item],
          isCheck: headerDefault === 'all' ? true : headerDefault?.includes(item),
          key: getKeyFilter(item, group),
          dataIndex: item,
          ...(group && { group: group }),
          ...getComponentName(data.properties[item].widget),
        });
      }
    });
  }
};

export default function getHeaderInPosttype({ data, isPottype = null, headerDefault = 'all' }) {
  const converHeader = [];
  if (isPottype) {
    getKey(data.json, converHeader, headerDefault);
  } else {
    getKey(data.json.properties.custom_fields.properties.filter, converHeader, headerDefault);
  }

  if (isPottype) {
    converHeader.push(
      ...[
        {
          title: 'ID',
          type: 'string',
          widget: 'shortAnswer',
          objectKey: '_id',
          filter: true,
          isCheck: true,
          key: '_id',
          dataIndex: '_id',
          field: '_id',
          ...getComponentName('shortAnswer'),
        },
        {
          title: 'Create By',
          type: 'string',
          widget: 'relation',
          objectKey: 'created_by',
          filter: true,
          isCheck: true,
          key: 'created_by',
          dataIndex: 'created_by',
          typeRelation: {
            title: 'user',
            entity: 'entity',
          },
          field: 'created_by',
          ...getComponentName('relation'),
        },
        {
          title: 'Updated By',
          type: 'string',
          widget: 'relation',
          objectKey: 'updated_by',
          filter: true,
          isCheck: true,
          key: 'updated_by',
          dataIndex: 'updated_by',
          typeRelation: {
            title: 'user',
            entity: 'entity',
          },
          ...getComponentName('relation'),
        },
        {
          title: 'Create At',
          type: 'string',
          widget: 'date',
          objectKey: 'created_at',
          filter: true,
          isCheck: true,
          key: 'created_at',
          dataIndex: 'created_at',
          field: 'created_at',
          ...getComponentName('date'),
        },
        {
          title: 'Updated At',
          type: 'string',
          widget: 'date',
          objectKey: 'updated_at',
          filter: true,
          isCheck: true,
          key: 'updated_at',
          dataIndex: 'updated_at',
          field: 'updated_at',
          ...getComponentName('date'),
        },
      ]
    );
  }

  return [...converHeader];
}
