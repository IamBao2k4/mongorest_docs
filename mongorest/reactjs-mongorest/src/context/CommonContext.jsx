'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CommonContext = createContext({});
export const CommonProvider = ({ children }) => {
  const [settingSidebar, setSettingSidebar] = useState({});

  useEffect(() => {
    const sidebar = localStorage.getItem('settingSidebar');
    if (sidebar) {
      setSettingSidebar(JSON.parse(sidebar));
    }
  }, []);

  const handleChangeSettingSidebar = (data, type) => {
    const dataSettings = JSON.parse(JSON.stringify(settingSidebar));
    dataSettings[type] = data;
    setSettingSidebar(dataSettings);
    localStorage.setItem('settingSidebar', JSON.stringify(dataSettings));
  };

  return (
    <CommonContext.Provider
      value={{
        settingSidebar,
        setSettingSidebar,
        handleChangeSettingSidebar,
      }}>
      {children}
    </CommonContext.Provider>
  );
};

export const useCommon = () => useContext(CommonContext);
