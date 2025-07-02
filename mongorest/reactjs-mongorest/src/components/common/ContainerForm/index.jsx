import { lazy } from 'react';
const JsonForm = lazy(() => import('../../builders/builder/JsonForm'));

export default function ContainerForm({ schema, onChangeFormData, formData, setFormData, errors }) {
  return (
    <div className='w-full'>
      <JsonForm
        schema={schema?.json || ''}
        uischema={schema?.ui || ''}
        initFormData={formData}
        onChangeFormData={(data) => onChangeFormData({ data, type: 'left' })}
        hideBtnSubmit
        setFormData={setFormData}
        errors={errors}
      />
    </div>
  );
}
