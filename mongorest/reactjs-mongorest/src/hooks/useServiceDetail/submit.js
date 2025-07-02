import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { formApi } from '@/services/form';

export const formatBlocks = (blocks) => {
  if (!(blocks?.length > 0)) {
    return null;
  }
  
  let formDataBlock = {};
  let count = {};
  blocks?.map((item) => {
    const slugBlock = Object.keys(item)[0];
    const dataBLock = item[slugBlock];

    if (slugBlock in formDataBlock) {
      formDataBlock[slugBlock + '___' + count[slugBlock]] = dataBLock || {};
      count[slugBlock] = count[slugBlock] + 1;
    } else {
      formDataBlock[slugBlock] = dataBLock || {};
      count[slugBlock] = 1;
    }
  });

  return formDataBlock;
};

export const onSubmitGroupfield = async ({ _data, schemaBuilder }) => {
  const json = JSON.parse(schemaBuilder.json);
  json.title = _data.name;
  json.description = _data.name;
  const dataGroupfield = {
    ..._data,
    is_active: 1,
    json_schema: {
      ...json,
      form: {
        json: JSON.stringify(json),
        ui: schemaBuilder.ui,
      },
    },
    ui_schema: JSON.parse(schemaBuilder.ui),
  };
  return dataGroupfield;
};

export const onSubmitForm = async ({ _data, id, schemaBuilder, locale }) => {
  const { addForm } = formApi(locale);

  const formDataLanguage = _data?.formDataLanguage
    ? JSON.parse(JSON.stringify(_data?.formDataLanguage))
    : null;

  if (
    formDataLanguage?.jsonschemaform?.jsonschema?.properties &&
    typeof formDataLanguage?.jsonschemaform?.jsonschema?.properties !== 'object'
  ) {
    formDataLanguage.jsonschemaform.jsonschema.properties = {};
  }
  const jsonSchemaLanguage = formDataLanguage?.jsonschemaform?.jsonschema;
  const uiSchemaLanguage = formDataLanguage?.jsonschemaform?.uischema;
  const propertiesFormLanguage = jsonSchemaLanguage?.properties;

  let keyLanguage = Object.keys(propertiesFormLanguage || {});

  delete _data?.formDataLanguage;
  const json = JSON.parse(schemaBuilder?.json);
  const keyCurrentProperties = Object.keys(json?.properties || {});

  if (keyCurrentProperties?.length > 0) {
    keyCurrentProperties?.map((item) => {
      if (
        propertiesFormLanguage?.[item] &&
        json?.properties?.[item] &&
        json?.properties?.[item]?.uid !== propertiesFormLanguage?.[item]?.uid
      ) {
        propertiesFormLanguage[item]['uid'] = json?.properties?.[item]?.uid;
      }
      const _f = json?.properties[item];
      delete _f['allProperties'];
    });
  }
  let data, result;

  if (id && id !== 'new') {
    keyCurrentProperties.map((item) => {
      if (!json?.properties?.[item]?.uid) {
        json.properties[item].uid = uuidv4();
      }
    });

    data = {
      formdata: {
        name: _data?.name,
        is_active: true,
        is_redirect: _data.is_redirect || null,
        embedded: '1',
        is_captcha: 0,
      },
      uischema: JSON.parse(schemaBuilder.ui),
      jsonschema: json,
    };

    if (formDataLanguage) {
      let keyDifference = [];
      if (keyCurrentProperties?.length >= keyLanguage?.length) {
        keyDifference = _.difference(keyCurrentProperties, keyLanguage);
      } else {
        keyDifference = _.difference(keyLanguage, keyCurrentProperties);
      }

      if (keyDifference?.length > 0 && jsonSchemaLanguage) {
        keyDifference?.map((item) => {
          if (keyCurrentProperties?.includes(item)) {
            propertiesFormLanguage[item] = json?.properties?.[item];
            uiSchemaLanguage[item] = JSON.parse(schemaBuilder.ui)?.[item];
            uiSchemaLanguage['ui:order'].push(item);
          } else {
            delete propertiesFormLanguage[item];
            uiSchemaLanguage[item];
            uiSchemaLanguage['ui:order'] = JSON.parse(schemaBuilder.ui)?.['ui:order']?.filter(
              (u) => u !== item
            );
          }
        });
      }
    }

    result = await formApi(locale).updateForm({
      id,
      data,
    });

    if (formDataLanguage) {
      if (Object.keys(propertiesFormLanguage || {})?.length > 0) {
        Object.keys(propertiesFormLanguage)?.map((item) => {
          const _f = propertiesFormLanguage[item];
          delete _f['allProperties'];
        });
      }

      const _data = jsonSchemaLanguage
        ? {
            formdata: {
              ...formDataLanguage?.jsonschemaform?.formdata,
              is_redirect: formData.is_redirect || null,
            },
            uischema: uiSchemaLanguage,
            jsonschema: jsonSchemaLanguage,
          }
        : {
            ...data,
            formdata: {
              ...formDataLanguage?.jsonschemaform?.formdata,
              is_redirect: formData.is_redirect || null,
            },
          };

      await formApi(locale === 'vi' ? 'en' : 'vi').updateForm({
        id: router.query.id,
        data: _data,
      });
    }
  } else {
    Object.keys(json.properties).map((item) => {
      json.properties[item].uid = uuidv4();
    });
    data = {
      formdata: {
        name: _data?.name,
        is_active: true,
        is_redirect: _data.is_redirect || null,
        embedded: '1',
        is_captcha: 0,
      },
      uischema: JSON.parse(schemaBuilder.ui),
      jsonschema: json,
    };

    result = await addForm({ data });

    if (result?.data?.id) {
      await formApi(locale === 'vi' ? 'en' : 'vi').updateForm({
        id: result?.data?.id,
        data,
      });
    }
  }
};
