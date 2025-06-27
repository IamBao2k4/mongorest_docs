import { WrapperField } from '@/components/builders/elements';
import { convertToSlug } from '@/helpers/convertToSlug';
import _ from 'lodash';
import { Fragment, useEffect, useRef } from 'react';
import { SlugEdit } from './components';

const Slug = ({
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
  ...props
}) => {
  let error = _.get(props, `formContext.errors[${id}]`);
  const initialValueRef = useRef(value);

  useEffect(() => {
    // Only set up the event listeners if the initial value is null/empty
    if (!initialValueRef.current) {
      const handleChangeInput = function (input) {
        return function () {
          const slug = convertToSlug(input?.value);
          onChange(slug);
        };
      };

      const inputs = document.querySelectorAll(`#${schema?.depend_field || 'root_title'}`);
      Array.from(inputs).forEach((input) => {
        if (input) {
          input.addEventListener('keyup', handleChangeInput(input));
        }
      });

      return () => {
        Array.from(inputs).forEach((input) => {
          if (input) {
            input.removeEventListener('keyup', handleChangeInput(input));
          }
        });
      };
    }
  }, []);

  return (
    <Fragment>
      {(type === 'edit' || type === 'filter') && (
        <WrapperField
          showLabel={type !== 'filter'}
          title={schema?.title}
          required={required}
          description={schema?.description}
          error={error}>
          <SlugEdit
            onChange={onChange}
            value={value || []}
            isDisabled={schema?.isDisable}
            defaultValue={schema?.default}
            options={options}
            placeholder={schema?.placeholder}
          />
        </WrapperField>
      )}
    </Fragment>
  );
};

export default Slug;
