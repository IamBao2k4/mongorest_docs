import { WrapperField } from '@/components/builders/elements';
import _ from 'lodash';
import { Fragment } from 'react';
import { SelectEdit, SelectFilter, SelectTable } from './components';

const SelectComp = ({
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

  return (
    <Fragment>
      {type === 'edit' && (
        <WrapperField
          showLabel={type !== 'filter'}
          title={schema?.title}
          required={required}
          description={schema?.description}
          error={error}>
          <SelectEdit
            isMulti={schema?.isMultiple}
            choices={schema?.choices}
            onChange={onChange}
            value={value || []}
            isDisabled={schema?.isDisable}
            defaultValue={schema?.default}
            allowNull={schema?.allowNull}
            isTree={schema?.isTree}
          />
        </WrapperField>
      )}

      {type === 'filter' && (
        <SelectFilter
          isMulti={schema?.isMultiple}
          choices={schema?.choices}
          onChange={onChange}
          value={value || []}
          isDisabled={schema?.isDisable}
          defaultValue={schema?.default}
          allowNull={schema?.allowNull}
          isTree={schema?.isTree}
        />
      )}

      {type === 'table' && (
        <SelectTable
          value={value}
          isMulti={schema?.isMultiple}
          choices={schema?.choices}
        />
      )}
    </Fragment>
  );
};
export default SelectComp;
