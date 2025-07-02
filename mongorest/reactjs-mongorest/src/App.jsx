import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from './components/layout';
import { AllRemaining, AllRemainingDetailId, AllRemainingDetailNew } from './pages/AllRemaining';
import { Entity, EntityDetail } from './pages/Entity';
import { Home } from './pages/Home';
import Login from './pages/Login';
import { RoleDetail } from './pages/Role';
import { PageSettings } from './pages/Settings';

// Cấu hình ngôn ngữ
const supportedLanguages = ['en', 'vi'];
const defaultLanguage = 'vi';

// Định nghĩa routes
const appRoutes = [
  { path: '/', element: <Home /> },
  { path: '/entity', element: <Entity /> },
  { path: '/entity/:id', element: <EntityDetail /> },
  { path: '/role/:id', element: <RoleDetail /> },
  { path: '/:entity', element: <AllRemaining /> },
  { path: '/:entity/new', element: <AllRemainingDetailNew /> },
  { path: '/:entity/:id', element: <AllRemainingDetailId /> },
  { path: '/settings', element: <PageSettings /> },
];

// Component xử lý trailing slash
function RemoveTrailingSlash() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { pathname, search, hash } = location;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      navigate(`${pathname.slice(0, -1)}${search}${hash}`, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

// Component xử lý ngôn ngữ từ URL
const LanguageHandler = ({ children }) => {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra nếu có ngôn ngữ trong URL params
    if (lang && supportedLanguages.includes(lang)) {
      // Đổi ngôn ngữ nếu khác với hiện tại
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    } else if (lang && !supportedLanguages.includes(lang)) {
      // Nếu ngôn ngữ không hợp lệ, redirect về ngôn ngữ mặc định
      const pathWithoutLang = location.pathname.replace(`/${lang}`, '');
      const newPath = pathWithoutLang || '/';
      navigate(newPath, { replace: true });
    }
  }, [lang, i18n, location, navigate]);

  return children;
};

// Component redirect cho tiếng Việt (loại bỏ /vi prefix)
const VietnameseRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { pathname, search, hash } = location;

    if (pathname.startsWith('/vi/')) {
      // Chuyển hướng từ /vi/* đến /*
      const newPath = pathname.replace('/vi', '') || '/';
      navigate(`${newPath}${search}${hash}`, { replace: true });
    } else if (pathname === '/vi') {
      // Chuyển hướng từ /vi đến /
      navigate(`/${search}${hash}`, { replace: true });
    }
  }, [location, navigate]);

  return null;
};

// Component xử lý root redirect
const RootLanguageRedirect = () => {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    // Đặt ngôn ngữ mặc định khi không có ngôn ngữ trong URL
    const pathLang = location.pathname.split('/')[1];
    if (!supportedLanguages.includes(pathLang)) {
      i18n.changeLanguage(defaultLanguage);
    }
  }, [i18n, location]);

  return null;
};

// Layout chính với xử lý ngôn ngữ
const MainLayout = () => {
  return (
    <>
      <RemoveTrailingSlash />
      <VietnameseRedirect />
      <RootLanguageRedirect />

      <Routes>
        <Route element={<Layout />}>
          {/* Routes chính */}
          {appRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={element}
            />
          ))}
        </Route>
      </Routes>
    </>
  );
};

// Layout cho tiếng Anh
const EnglishLayout = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage('en');
  }, [i18n]);

  return (
    <LanguageHandler>
      <MainLayout />
    </LanguageHandler>
  );
};

// Layout cho tiếng Việt (mặc định)
const VietnameseLayout = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage('vi');
  }, [i18n]);

  return (
    <LanguageHandler>
      <MainLayout />
    </LanguageHandler>
  );
};

// Component App chính
const App = () => {
  return (
    <Routes>
      <Route
        path='/login'
        element={<Login />}
      />
      <Route
        path='/en/login'
        element={<Login />}
      />
      {/* Routes cho tiếng Anh với prefix /en */}
      <Route
        path='/en/*'
        element={<EnglishLayout />}
      />
      {/* Routes mặc định (tiếng Việt, không có prefix) */}
      <Route
        path='/*'
        element={<VietnameseLayout />}
      />
    </Routes>
  );
};

export default App;
