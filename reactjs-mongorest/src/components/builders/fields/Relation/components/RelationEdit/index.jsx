import { ENUM_TYPE_SELECT_TAG } from '@/data/enum';
import { getApiIndex } from '@/helpers/getApiIndex';
import _ from 'lodash';
import { useState } from 'react';
import { RelationProvider } from '../../context';
import TagsElement from './TagsElement';
import { WrapperField } from '@/components/builders/elements';
import { withRelation } from '@/hooks/withRelation';
import TreeDropdown from './Dropdown';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const RelationEdit = ({ id, schema, value, onChange, type = 'edit', required, ...props }) => {
  let error = _.get(props, `formContext.errors[${id}]`);
  const params = useParams();
  const { lang } = params;
  const [loading, setLoading] = useState(false);
  const { jsonSchema } = useAuth();
  const _type = schema?.typeRelation?.title || 'entity';
  const [getData] = getApiIndex(_type, lang, jsonSchema);

  const _value = value
    ? typeof value === 'string' || (typeof value === 'object' && !Array.isArray(value))
      ? [value]
      : value
    : [];

  return (
    <RelationProvider
      schema={schema}
      value={_value}
      type={type}
      typeRelation={schema?.typeRelation}
      onChange={onChange}>
      <WrapperField
        showLabel={type !== 'filter'}
        title={schema?.title}
        required={required}
        description={schema?.description}
        error={error}>
        {schema?.is_tree ? (
          <div className='relative'>
            <TreeDropdown
              getData={getData}
              value={_value}
              onChange={onChange}
            />
          </div>
        ) : (
          <div
            id={id}
            className={'mb-0 w-full relative'}>
            <TagsElement
              getDataProp={getData}
              type={schema?.typeRelation}
              typeComponent={type}
              schema={schema}
              typeSearch={
                schema?.typeSelect === ENUM_TYPE_SELECT_TAG.once
                  ? ENUM_TYPE_SELECT_TAG.once
                  : ENUM_TYPE_SELECT_TAG.multiple
              }
              isLoading={loading}
              setLoading={setLoading}
              onChange={onChange}
              {...props}
            />
          </div>
        )}
      </WrapperField>
    </RelationProvider>
  );
};

export default withRelation(RelationEdit);
