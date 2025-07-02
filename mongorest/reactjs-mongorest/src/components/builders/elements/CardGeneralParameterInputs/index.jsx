'use client';

import { classifyFieldsIntoGroups } from '@/helpers/classifyFieldsIntoGroups';
import { categoryType, defaultDataProps, defaultUiProps } from '@/helpers/utils';
import { Fragment, useState } from 'react';
import { useParams } from 'react-router-dom';
import GeneralParameterInputs from '../GeneralParameterInputs';
import WrapperSetting from '../WrapperSetting';
export default function CardGeneralParameterInputs({
  parameters,
  onChange,
  allFormInputs,
  mods,
  showObjectNameInput = true,
  fields,
  type,
}) {
  const [keyState, setKeyState] = useState(parameters.name);
  const [errors, setErrors] = useState(null);
  const params = useParams();

  return (
    <Fragment>
      <div className='grid grid-cols-2 gap-4'>
        {showObjectNameInput ? (
          <WrapperSetting
            title='Object Key'
            required={true}
            disabled={type === 'form' && params.id !== 'new'}
            value={keyState || ''}
            onChange={(ev) => setKeyState(ev.target.value)}
            onBlur={(ev) => {
              const { value } = ev.target;
              !value &&
                setErrors({
                  ...errors,
                  objectName: 'Object Name is required',
                });
              if (
                value === parameters.name ||
                !(parameters.neighborNames && parameters.neighborNames.includes(value))
              ) {
                onChange({
                  ...parameters,
                  name: value,
                });
              } else {
                setKeyState(parameters.name);
                onChange({ ...parameters });
              }
            }}
            error={errors?.objectName}
          />
        ) : null}

        <WrapperSetting
          title='Display Name'
          required={true}
          value={parameters.title || ''}
          onChange={(ev) => {
            onChange({ ...parameters, title: ev.target.value });
          }}
          error={errors?.name}
        />

        <WrapperSetting
          title='Description'
          value={parameters.description || ''}
          onChange={(ev) => {
            onChange({ ...parameters, description: ev.target.value });
          }}
        />

        <WrapperSetting
          title='Fields'
          required={true}
          value={parameters.category}
          onChange={(val) => {
            const newCategory = val;

            const newProps = {
              ...defaultUiProps(newCategory, allFormInputs),
              ...defaultDataProps(newCategory, allFormInputs),
              name: parameters.name,
              required: parameters.required,
            };
            if (newProps.$ref !== undefined && !newProps.$ref) {
              const firstDefinition = Object.keys(parameters.definitionData)[0];
              newProps.$ref = `#/definitions/${firstDefinition || 'empty'}`;
            }
            onChange({
              ...newProps,
              title: newProps.title || parameters.title,
              default: newProps.default || '',
              type: newProps.type || categoryType(newCategory, allFormInputs),
              category: newProps.category || newCategory,
            });
          }}
          options={classifyFieldsIntoGroups(fields, type)}
        />
      </div>
      <GeneralParameterInputs
        category={parameters.category}
        parameters={parameters}
        onChange={onChange}
        mods={mods}
        allFormInputs={allFormInputs}
      />
    </Fragment>
  );
}
