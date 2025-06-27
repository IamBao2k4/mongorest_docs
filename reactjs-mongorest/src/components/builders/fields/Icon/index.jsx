import _ from 'lodash';
import React, { Fragment } from 'react';
import { TextError, TextLabel } from '@/components/builders/elements';
import { IconEdit } from './components';

const Icon = ({
  id,
  isFilter,
  schema,
  disabled = false,
  options,
  required,
  onChange,
  label,
  width,
  value,
  type = 'edit',
  isPined,
  onClick = () => {},
  ...props
}) => {
  let error = _.get(props, `formContext.errors[${id}]`);
  return (
    <Fragment>
      {(type === 'edit' || type === 'filter') && (
        <>
          {type !== 'filter' && (
            <TextLabel
              title={label}
              required={required || schema?.required}
              description={schema?.description}
            />
          )}
          <IconEdit
            id={id}
            onChange={onChange}
            value={value}
          />
          {!!error && <TextError text={error} />}
        </>
      )}
    </Fragment>
  );
};
export default Icon;
