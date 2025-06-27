'use client';

import {
  DefaultGridTemplate,
  FieldTemplate,
  LayoutGridField,
  ObjectFieldTemplate,
  WrapperField,
} from '@/components/builders/elements';
import { Button } from '@/components/ui/Button';
import Form from '@rjsf/core';
import { BetweenVerticalEnd, MoveDown, MoveUp, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Boolean,
  Checkbox,
  Condition,
  Data,
  DateAndTime,
  File,
  Href,
  Icon,
  LongAnswer,
  MultiFile,
  Number,
  Radio,
  Relation,
  Select,
  ShortAnswer,
  Slug,
  MultiImage,
  Range,
  Function,
} from '../fields';
import validator from '@rjsf/validator-ajv8';

function JsonForm({
  initFormData,
  uischema,
  schema,
  setFormData,
  onChangeFormData,
  errors,
  folderId,
  className,
  title,
  children,
}) {
  const [formDataState, setFormDataState] = useState(initFormData || {});
  const [error, setError] = useState(null);

  const updateFormData = (data) => {
    try {
      setFormDataState(data);
      if (onChangeFormData) {
        return onChangeFormData?.(data);
      }
      setFormData?.(data);
    } catch (err) {
      console.error('Error updating form data:', err);
    }
  };

  useEffect(() => {
    if (initFormData) setFormDataState(initFormData);
  }, [JSON.stringify(initFormData)]);

  // Parse schema and uischema safely
  let parsedSchema, parsedUiSchema;
  try {
    parsedSchema = typeof schema === 'string' ? JSON.parse(schema) : schema;
    parsedUiSchema = typeof uischema === 'string' ? JSON.parse(uischema) : uischema;
  } catch (err) {
    console.error('Error parsing schema or uischema:', err);
    return <div>Error parsing schema: {err.message}</div>;
  }

  if (!parsedSchema || !parsedSchema.type) {
    return <div>Invalid schema: missing type property</div>;
  }

  if (error) {
    return (
      <div className='p-4 border border-red-300 rounded bg-red-50'>
        <h3 className='text-red-800 font-semibold'>Form Error:</h3>
        <p className='text-red-600'>{error}</p>
        <button
          onClick={() => setError(null)}
          className='mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm'>
          Retry
        </button>
      </div>
    );
  }
  
  console.log('🚀 ~ parsedSchema:', parsedUiSchema);

  try {
    return (
      <div>
        {title && <p className='text-[24px] font-bold mb-2'>{title}</p>}
        <Form
          templates={{
            FieldTemplate,
            ObjectFieldTemplate,
            GridTemplate: DefaultGridTemplate,
          }}
          fields={{
            LayoutGridField,
          }}
          className={className}
          schema={parsedSchema}
          uiSchema={parsedUiSchema}
          validator={validator}
          widgets={{
            FileWidget: File,
            multipleFiles: MultiFile,
            relation: Relation,
            date: DateAndTime,
            time: DateAndTime,
            dateTime: DateAndTime,
            select: Select,
            checkbox: Checkbox,
            radio: Radio,
            TextareaWidget: LongAnswer,
            boolean: Boolean,
            Boolean: Boolean,
            PasswordWidget: ShortAnswer,
            TextWidget: ShortAnswer,
            shortAnswer: ShortAnswer,
            longAnswer: LongAnswer,
            numberInput: Number,
            range: Range,
            UriKeyGen: Slug,
            condition: Condition,
            dataWidget: Data,
            href: Href,
            icon: Icon,
            multiImage: MultiImage,
            function: Function,
            autoGenKeyFromAnotherField: Slug,
          }}
          onChange={(formData) => {
            updateFormData(formData.formData);
          }}
          formContext={{
            errors: errors || {},
            folderId,
            formData: formDataState,
            setFormData,
          }}
          formData={formDataState}
          onError={(errors) => {
            console.error('Form validation errors:', errors);
          }}
          onSubmit={() => {}}>
          <div className={`hidden`}>
            <button type='submit'>Submit</button>
          </div>
        </Form>
        {children}
      </div>
    );
  } catch (err) {
    console.error('Form render error:', err);
    setError(err.message);
    return null;
  }
}

export default JsonForm;
