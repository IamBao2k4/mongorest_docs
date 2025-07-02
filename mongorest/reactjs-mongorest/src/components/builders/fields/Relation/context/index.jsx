'use client';

import { ENUM_TYPE_TAG } from '@/data/enum';
import { createContext, useEffect, useState, useContext, useMemo } from 'react';

const RelationContext = createContext({});

export const RelationProvider = ({ children, schema, value, onChange }) => {
  const [selectedValue, setSelectedValue] = useState([]);
  const [posttypeId, setPosttypeId] = useState(schema?.post_type || null);
  const [group, setGroup] = useState(() => {
    return schema?.typeRelation === ENUM_TYPE_TAG.category ||
      schema?.typeRelation === ENUM_TYPE_TAG.post
      ? schema?.post_type
        ? [{ key: schema?.post_type || '' }]
        : []
      : schema?.tagGroup || [];
  });

  const isAllGroup = useMemo(() => {
    return (schema?.typeRelation === ENUM_TYPE_TAG.category && schema?.post_type) ||
      (schema?.typeRelation === ENUM_TYPE_TAG.post && schema?.post_type)
      ? false
      : schema?.tagGroup
      ? false
      : true;
  }, []);

  useEffect(() => {
    setSelectedValue(
      Array.isArray(value) ? value?.filter((item) => Object.keys(item)?.length > 0) : []
    );
  }, [value]);

  const onChangeProps = (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const convertSendData = data.map((item) => ({
        ...item,
        title: item.title || item.name,
      }));
      setSelectedValue([...convertSendData]);
      onChange([...convertSendData]);
    } else {
      onChange([]);
    }
  };

  return (
    <RelationContext.Provider
      value={{
        group,
        setGroup,
        posttypeId,
        setPosttypeId,
        isAllGroup,
        typeRelation: schema?.typeRelation,
        onChangeProps,
        selectedValue,
      }}>
      {children}
    </RelationContext.Provider>
  );
};

export const useRelation = () => useContext(RelationContext);
