import { useState } from 'react';
import useEntityDetail from './useEntityDetail';
import useJson from './useJson';
import { submitDataDetail } from './utils';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useToast } from '../use-toast';
import { validateFormSubmit } from '@/helpers/validateFormSubmit';
// import Ajv from 'ajv';
// import addFormats from 'ajv-formats';

// // Tạo AJV instance với custom keywords
// const createAJVWithCustomKeywords = () => {
//   const ajv = new Ajv({
//     allErrors: true,
//     strict: false, // Tắt strict mode để ignore unknown keywords
//   });
//   addFormats(ajv);

//   // Thêm custom keywords để AJV ignore chúng
//   const uiKeywords = [
//     'expanded',
//     'widget',
//     'classNames',
//     'ui:widget',
//     'ui:options',
//     'ui:order',
//     'ui:title',
//     'ui:description',
//     'typeRelation',
//     'filter',
//   ];

//   uiKeywords.forEach((keyword) => {
//     ajv.addKeyword({
//       keyword: keyword,
//       schemaType: ['string', 'boolean', 'object', 'array'],
//       compile: () => () => true, // Always pass validation
//     });
//   });

//   return ajv;
// };

// const customAjv = createAJVWithCustomKeywords();

// //Helper function để parse AJV errors
// const parseAJVErrors = (ajvErrors) => {
//   const errorMap = {};

//   if (!ajvErrors || !Array.isArray(ajvErrors)) return errorMap;
//   ajvErrors.forEach((error) => {
//     if (error.keyword === 'required') {
//       const missingProperty = error.params?.missingProperty;
//       const instancePath = error.instancePath;

//       if (instancePath === '') {
//         // Root level required field: "title"
//         errorMap[missingProperty] = `${missingProperty} is required`;
//       } else {
//         // Nested required field: "/newInput2" -> "newInput2.newInput1"
//         const parentPath = instancePath.slice(1); // Remove leading slash
//         const dotPath = `${parentPath}.${missingProperty}`;
//         const underscorePath = `${parentPath}_${missingProperty}`;

//         errorMap[dotPath] = `${missingProperty} is required`;
//         errorMap[underscorePath] = `${missingProperty} is required`;
//       }
//     } else {
//       // Other validation types (minLength, maxLength, pattern, etc.)
//       const fieldPath = error.instancePath.slice(1); // Remove leading slash
//       if (fieldPath) {
//         const dotPath = fieldPath.replace(/\//g, '.');
//         const underscorePath = fieldPath.replace(/\//g, '_');

//         errorMap[dotPath] = error.message;
//         errorMap[underscorePath] = error.message;
//       }
//     }
//   });
//   return errorMap;
// };

// Validation function
// const validateWithCustomAJV = (formData, schema) => {
//   try {
//     const validate = customAjv.compile(schema);
//     const valid = validate(formData);

//     if (!valid) {
//       const parsedErrors = parseAJVErrors(validate.errors);
//       return { valid: false, errors: parsedErrors };
//     }

//     return { valid: true, errors: {} };
//   } catch (error) {
//     console.error('Custom AJV validation error:', error);
//     return { valid: false, errors: { _global: 'Schema validation failed' } };
//   }
// };

function generatePropertiesFromUI(res, uiSchema) {
  // Process each field based on the ui:order array
  if (uiSchema['ui:order'] && Array.isArray(uiSchema['ui:order'])) {
    uiSchema['ui:order'].forEach((fieldName) => {
      if (uiSchema[fieldName] && !uiSchema[fieldName]['ui:widget']) {
        if (uiSchema[fieldName]?.items) {
          res[fieldName] = {
            items: {
              type: 'object',
              properties: {},
            },
          };
          generatePropertiesFromUI(res[fieldName].items.properties, uiSchema[fieldName].items);
        } else {
          res[fieldName] = {
            type: 'object',
            properties: {},
          };
          generatePropertiesFromUI(res[fieldName].properties, uiSchema[fieldName]);
        }
      } else {
        res[fieldName] = {
          widget: uiSchema[fieldName]?.['ui:widget'] || 'shortAnswer',
        };
      }
    });
  }
}

export default function useServiceDetail({
  id,
  type = null,
  notInitData = false,
  entity,
  redirect,
}) {
  const params = useParams();
  const { pathname } = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  //NOTE: Get file json theo posttype
  const { posttype, schema, schemaBuilder, setSchemaBuider, formatData } = useJson({
    entity: type || entity,
  });

  //NOTE: Check có phải là call detail hay là tạp mới
  const idQuery = notInitData ? null : params?.id && params?.id !== 'new' ? params?.id : null;

  let properties = {
    ...(schema ? JSON.parse(schema.json).properties : {}),
  };

  let ui = {
    ...(schema ? JSON.parse(schema.ui) : {}),
  };

  const res = {};
  generatePropertiesFromUI(res, JSON.parse(JSON.stringify(ui || {})));

  try {
    const _de = JSON.parse(schema.json)?.dependencies?.type?.oneOf;
    if (_de && Array.isArray(_de)) {
      _de.map((item) => {
        delete item.properties.type;
        properties = {
          ...properties,
          ...item.properties,
        };
      });
    }
  } catch (error) {
    console.log('🚀 ~ error:', error);
  }

  const {
    formData,
    setFormData,
    titlePage,
    setGetByLanguage,
    onChangeFormData,
    publishDate,
    status,
    statusLog,
    selects,
    setSelects,
    getData,
    onChangeAdvance,
  } = useEntityDetail({
    id,
    idQuery,
    entity,
    setLoading,
    properties,
    setSchemaBuider,
    posttype,
  });

  const onSubmit = async function (
    options = {
      is_active: null,
      published_start: null,
      published_end: null,
    }
  ) {
    // Clear previous errors
    setErrors({});

    if (!schema || !schema.json) {
      toast({ description: 'Schema not found' });
      return;
    }

    try {
      // const _schema = JSON.parse(schema.json);

      // // Validate with custom AJV
      // const ajvValidation = validateWithCustomAJV(formData, _schema);
      // if (!ajvValidation.valid) {
      //   console.log('🚀 ~ Validation errors found:', ajvValidation.errors);
      //   setErrors(ajvValidation.errors);
      //   return;
      // }

      const formErrors = validateFormSubmit({
        formData,
        entity,
        schema,
        schemaBuilder,
        message: toast,
      });

      if (Object.keys(formErrors).length > 0) {
        return setErrors(formErrors);
      }

      setLoading(true);

      const __id = id || idQuery;

      const data = await submitDataDetail({
        entity,
        type,
        id: __id === 'new' || !__id ? null : __id,
        properties: res,
        data: { ...options, ...formData },
        blocks: selects,
        schemaBuilder,
        locale: params.lang,
        posttype,
      });

      if (data) {
        toast({
          description: id || idQuery || type === 'edit' ? 'Update success' : 'Create success',
        });

        if (typeof redirect === 'boolean' && !redirect) {
          // Don't redirect
        } else {
          if (redirect) {
            navigate(redirect);
          } else {
            const newPath = pathname.split('/');
            newPath.pop();
            navigate(newPath.join('/'));
          }
        }

        setResult(data);
        setLoading(false);
        return data;
      }

      setLoading(false);
      return null;
    } catch (submitError) {
      console.error('🚀 ~ Submit error:', submitError);
      toast({ description: 'Submit failed' });
      setLoading(false);
    }
  };

  return {
    schema,
    schemaBuilder,
    formData,
    setFormData,
    setSchemaBuider,
    onChangeFormData,
    titlePage,
    selects,
    setSelects,
    status,
    publishDate,
    loading,
    setLoading,
    onSubmit,
    errors,
    setErrors,
    result,
    getData,
    setGetByLanguage,
    formatData,
    statusLog,
    onChangeAdvance,
  };
}
