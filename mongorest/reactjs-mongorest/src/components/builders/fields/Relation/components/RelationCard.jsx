import { Tag } from '@/components/ui/Tag';
import clsx from 'clsx';
import { withRelation } from '@/hooks/withRelation';
import React, { Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RelationCard = ({ value, inforFields, onChangeFilterQuery }) => {
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
        <p>{item?.name || item?.title}</p>
      </Tag>
    );
  };

  return (
    <div className='relative'>
      <div className='flex gap-2 flex-wrap'>
        {value &&
          Array.isArray(value) &&
          value?.map((item, index) => <Fragment key={index}>{_renderTag(item)}</Fragment>)}
      </div>
    </div>
  );
};

export default withRelation(RelationCard);
