import { getErrors } from '@/helpers/getErrors';

export function validateFormSubmit({ formData, posttype, message, schemaBuilder, schema }) {
  let formErrors, additionalRequiredFields;
  const { required: schemaRequiredFields = [] } = schema?.json ? JSON.parse(schema.json) : {};

  switch (posttype) {
    case 'form-builder':
      formErrors = getErrors(formData, schemaRequiredFields, 'root') || {};
      if (
        Object.keys(JSON.parse(schemaBuilder.ui)).length === 0 ||
        JSON.parse(schemaBuilder.ui)['ui:order'].length === 0
      ) {
        message.error({ title: 'Vui lòng thêm ít nhất một custom field' });
        formErrors.custom_field = 'Custom field is required';
      }
      return formErrors;

    case 'group-fields':
      formErrors = getErrors(formData, ['name'], '') || {};
      if (
        Object.keys(JSON.parse(schemaBuilder.ui)).length === 0 ||
        JSON.parse(schemaBuilder.ui)['ui:order'].length === 0
      ) {
        message.error({ title: 'Vui lòng thêm ít nhất một custom field' });
        formErrors.custom_field = 'Custom field is required';
      }
      return formErrors;

    case 'template-form':
      if (schema) {
        additionalRequiredFields = Object.entries(JSON.parse(schema.json).properties).filter(
          (e) => e[1].required
        );

        additionalRequiredFields.forEach((e) => {
          const errors = getErrors(formData[e[0]], e[1].required, `root_${e[0]}`);

          formErrors = { ...formErrors, ...errors };
        });
      }

      formErrors = {
        ...formErrors,
        ...getErrors(formData, schemaRequiredFields, 'root'),
      };

      return formErrors;

    case 'group-blocks':
    case 'rules':
    case 'roles':
    case 'tag-group':
    case 'tags':
    case 'templates':
    case 'media':
    case 'categories':
    case 'pages':
    case 'users':
    case 'menus':
    default:
      return getErrors(formData, schemaRequiredFields, 'root') || {};
  }
}
