'use client';

import { groupFieldsApi } from '@/services/group-fields';
import { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const BlocksContext = createContext({});
export const BlocksProvider = ({ children }) => {
  const [blocks, setBlocks] = useState([]);
  const params = useParams();
  const lang = params.lang;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const blocks = await groupFieldsApi(lang).getGroupFields({ params: { limit: 1000 } });
        const _res = {};
        blocks?.data?.map((item) => {
          _res[item?.slug] = { title: item.title, json: item.json_schema, ui: item.ui_schema };
        });
        setBlocks(_res);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return <BlocksContext.Provider value={{ blocks, setBlocks }}>{children}</BlocksContext.Provider>;
};

export const useBlocks = () => useContext(BlocksContext);
