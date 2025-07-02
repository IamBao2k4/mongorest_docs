'use client';

import { useAuth } from '@/context/AuthContext';
import { createContext, useContext, useState } from 'react';

const TableContext = createContext({});
export const TableProvider = ({ defaultState, children }) => {
  const { jsonSchema } = useAuth();
  const [inModal, setInModal] = useState(defaultState?.inModal);
  const [selectedFlat, setSelectedFlat] = useState([]);
  const [func, setFunc] = useState([]);

  const settings = jsonSchema?.[defaultState?.entity]?.settings || {};
  const properties = jsonSchema?.[defaultState?.entity]?.json?.properties || {};

  return (
    <TableContext.Provider
      value={{
        settings,
        inModal,
        setInModal,
        func,
        setFunc,
        selectedFlat,
        setSelectedFlat,
        properties,
        entity: defaultState?.entity,
      }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => useContext(TableContext);
