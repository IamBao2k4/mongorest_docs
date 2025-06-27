import _ from 'lodash';
import { LongAnswerEdit, LongAnswerFilter, LongAnswerTable } from './components';
import { TextError, TextLabel, WrapperField } from '@/components/builders/elements';

const textStyle = {
  maxHeight: 350,
  maxWidth: 500,
  overflowX: 'auto',
};
const TextEditor = ({
  id,
  schema,
  placeholder,
  value,
  required,
  title,
  onChange,
  type = 'edit',
  ...props
}) => {
  let error = _.get(props, `formContext.errors[${id}]`);

  return (
    <>
      {type === 'edit' ? (
        <WrapperField
          title={schema?.title}
          description={schema?.description}
          required={props.required}
          error={error}>
          <div
            id={id}
            className='w-100'>
            <LongAnswerEdit
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              defaultValue={props.default}
              row={schema?.row}
              ui={schema?.customRole}
              schema={schema}
            />
          </div>
        </WrapperField>
      ) : null}

      {type === 'filter' ? (
        <LongAnswerFilter
          id={id}
          onChange={onChange}
          value={value}
        />
      ) : null}

      {type === 'table' ? (
        <LongAnswerTable
          value={value}
          ui={schema?.customRole}
        />
      ) : null}
    </>
  );
};
export default TextEditor;
