import React from 'react';
import { RelationEdit, RelationTable, RelationCard } from './components';

const Relation = ({
  id,
  schema,
  value,
  onChange,
  type = 'edit',
  onChangeFilterQuery = () => {},
  ...props
}) => {
  return (
    <>
      {type === 'edit' || type === 'filter' ? (
        <RelationEdit
          type={type}
          schema={schema}
          id={id}
          value={value}
          onChange={onChange}
          inforFields={{ key: schema?.typeRelation?.title }}
          {...props}
        />
      ) : null}

      {type === 'card' ? (
        <RelationCard
          value={value}
          type={type}
          schema={schema}
          id={id}
          onChange={onChange}
          inforFields={{ key: schema?.typeRelation?.title }}
          {...props}
        />
      ) : null}

      {type === 'table' ? (
        <RelationTable
          value={value}
          type={type}
          group={schema?.group}
          typeKey={schema?.key}
          typeRelation={schema?.typeRelation}
          onChangeFilterQuery={onChangeFilterQuery}
          {...props}
        />
      ) : null}
    </>
  );
};

export default Relation;
