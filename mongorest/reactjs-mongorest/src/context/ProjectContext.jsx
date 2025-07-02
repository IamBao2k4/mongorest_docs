'use client';

import { setDomain, setLanguage } from '@/services/api';
import { createContext, Fragment, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const ProjectContext = createContext({});
export const ProjectProvider = ({ children }) => {
  const [domainApi, setDomainApi] = useState(null);
  const [lang, setLang] = useState(null);
  const { pathname } = useLocation();

  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  function getSubdomain() {
    const host = window.location.hostname;
    const parts = host.split('.');

    if (parts.length >= 3 && parts?.[0]?.split('-').length === 2) {
      setDomain(`https://${parts?.[0]?.split('-')?.[0]}.mangoads.com.vn`);
      setDomainApi(parts?.[0]?.split('-')?.[0]);
    } else {
      setDomain(import.meta.env.VITE_API_URL);
      setDomainApi(import.meta.env.VITE_API_URL);
    }
    return null;
  }

  useEffect(() => {
    const storedLang = localStorage.getItem('lang') || 'vi';
    setLanguage(storedLang);
    setLang(storedLang);
    i18n.changeLanguage(storedLang);
  }, []);

  const changeLanguage = (newLang) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    const currentHash = location.hash;

    localStorage.setItem('lang', newLang);
    setLanguage(newLang);
    if (newLang === 'en') {
      // Chuyển sang tiếng Anh: thêm /en prefix
      let newPath;
      if (currentPath.startsWith('/en/')) {
        // Đã có /en prefix
        newPath = currentPath;
      } else if (currentPath === '/') {
        newPath = '/en';
      } else {
        newPath = `/en${currentPath}`;
      }

      i18n.changeLanguage('en');
      setLang('en'); // Cập nhật state ngay lập tức
      navigate(`${newPath}${currentSearch}${currentHash}`, { replace: true });
    } else if (newLang === 'vi') {
      // Chuyển sang tiếng Việt: loại bỏ /en prefix
      let newPath;
      if (currentPath.startsWith('/en/')) {
        newPath = currentPath.replace('/en', '') || '/';
      } else if (currentPath === '/en') {
        newPath = '/';
      } else {
        newPath = currentPath;
      }

      i18n.changeLanguage('vi');
      setLang('vi'); // Cập nhật state ngay lập tức
      navigate(`${newPath}${currentSearch}${currentHash}`, { replace: true });
    }
  };

  useEffect(() => {
    getSubdomain();
  }, []);

  useEffect(() => {
    if (!lang) return;
    if (lang === 'en' && pathname === '/') {
      navigate('/en', { replace: true });
    }

    if (lang === 'vi' && pathname === '/en') {
      navigate('/', { replace: true });
    }

    if (lang === 'en' && !pathname.startsWith('/en/') && pathname !== '/en') {
      navigate(`/en${pathname}`, { replace: true });
    }

    if (lang === 'vi' && pathname.startsWith('/en/')) {
      navigate(pathname.replace('/en', ''), { replace: true });
    }
  }, [lang, pathname]);

  return (
    <ProjectContext.Provider value={{ domainApi, setDomainApi, lang, setLang, changeLanguage }}>
      {domainApi && lang ? children : null}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
