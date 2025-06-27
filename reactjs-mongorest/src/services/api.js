import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  withCredentials: false,
  timeout: 1000 * 60,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'X-Requested-Store': 'default',
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
});

// Thêm biến để lưu domain và language
let currentDomain = import.meta.env.VITE_API_URL;
let currentLanguage = 'vi'; // default language

const setDomain = (domain) => {
  currentDomain = domain || import.meta.env.VITE_API_URL;
  updateBaseURL();
};

const setLanguage = (language) => {
  currentLanguage = language;
  updateBaseURL();
};

// Function để update baseURL dựa trên domain và language
const updateBaseURL = () => {
  if (currentLanguage === 'en') {
    api.defaults.baseURL = `${currentDomain}/api/v1/en`;
  } else {
    api.defaults.baseURL = `${currentDomain}/api/v1`;
  }
};

const setToken = (token) => {
  api.defaults.headers.common['Authorization'] = `bearer ${token}`;
};

const setTenantHeader = (id) => {
  api.defaults.headers.common['X-Tenant-ID'] = id;
};

//  'Your role not have permission for tenant';
api.interceptors.request.use(
  function (config) {
    if (window.location.pathname.startsWith('/role-settings') && config.url.search('mge') >= 0) {
      config.headers['X-Tenant-ID'] = '67b2bc288ac7a801d196b4b0';
    }

    if (
      config.url.endsWith('auth/me') ||
      config.url.endsWith('entity') ||
      config.url.endsWith('media') ||
      config.url.startsWith('group-field') ||
      config.url.endsWith('tenant') ||
      config.url.search('tenant/') >= 0
    ) {
      config.baseURL = config.baseURL.replace('/api/v1/en', '/api/v1');
    }
    if (config.url.endsWith('login')) {
      delete config.headers?.['Authorization'];
    }
    return config;
  },
  async function (error) {
    if (error?.response?.status === 403) {
      Cookies.remove('userToken');
      if (error?.config?.url === 'api/v1/auth/me') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  function (response) {
    return response?.data || response;
  },
  async function (error) {
    if (error?.response?.status === 403) {
      Cookies.remove('userToken');
      if (error?.config?.url === 'api/v1/auth/me') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api, setToken, setTenantHeader, setDomain, setLanguage };
