import { Tag } from '@/components/ui/Tag';
import clsx from 'clsx';
import { withRelation } from '@/hooks/withRelation';
import React, { Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RelationTable = ({ value, inforFields, onChangeFilterQuery }) => {
  const _value = value
    ? typeof value === 'string' || (typeof value === 'object' && !Array.isArray(value))
      ? [value]
      : value
    : [];

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const _renderTag = (item) => {
    return (
      <Tag
        className={clsx('cursor-pointer font-medium !px-2 !py-[2px] !text-default-black')}
        onClick={() => {
          let param = {};
          param[`search[${inforFields?.keyTable}:in]`] = item._id;
          onChangeFilterQuery && onChangeFilterQuery(param);
          navigate(`${pathname}?${new URLSearchParams(param).toString()}`);
        }}>
        <p>
          {typeof item === 'string'
            ? item
            : item?.title || item?.name || item?.username || item?.email}
        </p>
      </Tag>
    );
  };

  return (
    <div className='relative'>
      <div className='flex gap-1 overflow-hidden whitespace-nowrap'>
        {Array.isArray(_value) && _value.length > 0 ? (
          <>
            {_value.slice(0, 3).map((item, index) => (
              <Fragment key={index}>{_renderTag(item)}</Fragment>
            ))}
            {_value.length > 3 && <span className='text-[#1677ff] cursor-pointer'>...</span>}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default withRelation(RelationTable);
