'use client';

import _ from 'lodash';

export const getErrors = (data = {}, fields = [], rootId = '', condition = {}) => {
  try {
    let errors = {};
    let errorsCustom = {};
    fields?.map?.((key) => {
      let isCheck = _.get(data, key);
      if (
        typeof isCheck !== 'boolean' &&
        (!isCheck ||
          isCheck?.search?.(/\S/g) == -1 ||
          (typeof isCheck == 'object' && Object.keys?.(isCheck)?.length == 0) ||
          isCheck == '<p><br></p>')
      ) {
        let path = rootId ? `${rootId}_${key?.replace(/\./g, '_')}` : key;
        let keyToUppercase = (key.charAt(0).toUpperCase() + key.slice(1)).replace(/_/g, ' ');
        errors[path] = `${keyToUppercase} is a required`;
      }
    });

    const allSchema = Object.keys(condition).map((item) => ({
      key: item,
      value: condition[item],
    }));

    const allValue = Object.keys(data).map((item) => ({
      key: item,
      value: data[item],
    }));

    for (let x = 0; x < allSchema.length; x++) {
      for (let y = 0; y < allValue.length; y++) {
        if (allSchema[x].key === allValue[y].key) {
          if (
            allSchema[x].value?.maxLength < allValue[y].value.length ||
            allValue[y].value.length < allSchema[x].value?.minLength
          ) {
            let path = rootId
              ? `${rootId}_${allSchema[x].key?.replace(/\./g, '_')}`
              : allSchema[x].key;
            let keyToUppercase = (
              allSchema[x].key.charAt(0).toUpperCase() + allSchema[x].key.slice(1)
            ).replace(/_/g, ' ');
            errorsCustom[path] = `${keyToUppercase} is not in the largest and smallest`;
          }
        }
      }
    }
    if (Object.keys(errors)?.length > 0) {
      return errors;
    } else if (Object.keys(errorsCustom)?.length > 0) {
      return errorsCustom;
    } else return false;
  } catch (error) {
    console.log('🚀 ~ getErrors ~ error:', error);
    return false;
  }
};
