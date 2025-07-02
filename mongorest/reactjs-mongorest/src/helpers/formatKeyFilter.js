function getValueArray(key, value) {
  return value.map((data) => data?._id)?.join(',');
}

function getValueObject(key, value) {
  return value?._id;
}

function getValue(key, value) {
  if (Array.isArray(value)) {
    return getValueArray(key, value);
  }

  if (typeof value === 'object') {
    return getValueObject(key, value);
  }

  return value;
}

function formatKeyFilter(rules) {
  if (!(rules?.length > 0)) return;
  const params = {};
  rules.forEach((item) => {
    if (!item.value) return;

    const key = `search[${item.field}:${item.operator}]`;
    params[key] = getValue(item.field, item.value);
  });

  return params;
}

export default formatKeyFilter;
