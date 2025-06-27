'use client';

import React, { createContext, useContext, useEffect, useState, Fragment } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { setTenantHeader, setToken } from '@/services/api';
import { entityApi } from '@/services/entity';
import getDataJson from '@/helpers/getDataJson';
import getHeaderInPosttype from '@/helpers/getHeaderInPosttype';
import Tenant from '@/components/layout/Tenant';
import { Image } from '@/components/ui/Image';
import { authApi, entityDataApi } from '@/services';
import { useProject } from './ProjectContext';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useProject();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [rules, setRules] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [jsonSchema, setJsonSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getCurrentUser, logout } = authApi();
  const [refreshSidebar, setRefreshSidebar] = useState(false);
  const [tenant, setTenant] = useState(null);
  const _roles = JSON.parse(JSON.stringify(roles));
  const listTenant = _roles?.map((item) => {
    return {
      label: item?.tenant_id?.title,
      value: item?.tenant_id?._id,
    };
  });

  const handleChangeTenant = (data) => {
    localStorage.setItem('tenant', data);
    setTenantHeader(data);
    loadTenant(data);
  };

  const loadTenant = async (id) => {
    try {
      const { data } = await entityDataApi().getDetail({
        entity: 'tenant',
        id,
        options: {
          headers: {
            'X-TENANT-ID': id,
            Authorization: `Bearer ${Cookies.get('userToken')}`,
          },
        },
      });
      setTenant(data);
    } catch (error) {
      localStorage.removeItem('tenant');
      setTenant(null);
      console.log('🚀 ~ loadTenant ~ error:', error);
    }
  };

  useEffect(() => {
    try {
      if (localStorage.getItem('tenant') && user) {
        const _val = localStorage.getItem('tenant');
        setTenantHeader(_val);
        loadTenant(_val);
      }
    } catch (error) {
      console.log('🚀 ~ useEffect ~ error:', error);
      localStorage.removeItem('tenant');
    }
  }, [user]);

  useEffect(() => {
    if (tenant && user) getJson();
  }, [tenant?._id, user]);

  useEffect(() => {
    if (refreshSidebar) {
      getJson();
      setRefreshSidebar(false);
    }
  }, [refreshSidebar]);

  useEffect(() => {
    getInit();
  }, [lang]);

  async function getInitJSON() {
    try {
      const { data: dataEntity } = await entityApi().getEntity({ params: { limit: 200 } });
      const { data: dataPosttype } = await entityDataApi().getData({
        entity: 'post-type',
        params: { limit: 200 },
      });
      const _dataRes = {};
      [...dataEntity, ...dataPosttype.map((item) => ({ ...item, type: 'post-type' }))]?.forEach(
        (cur) => {
          if (cur.json_schema) {
            _dataRes[cur.mongodb_collection_name] = {
              ...cur,
              filter: getHeaderInPosttype({ data: { json: cur.json_schema }, isPottype: true }),
              json: cur.json_schema,
              ui: cur.ui_schema,
              settings: cur.settings || null,
            };
          }
        }
      );
      return _dataRes;
    } catch (err) {
      console.error('Error in getInitJSON:', err);
    }
  }

  const getJson = async () => {
    const data = getDataJson();
    const dataEntity = await getInitJSON();
    const _val = { ...dataEntity, ...data };
    setJsonSchema(_val);
  };

  async function getInit() {
    try {
      const token = Cookies.get('userToken');
      if (token) {
        setToken(token);
        await getDataUser();
        if (location.pathname === '/login') navigate('/');
      } else if (location.pathname === '/register') {
        navigate('/register');
      } else {
        onLogout();
      }
    } catch (err) {
      console.error('Error in getInit:', err);
    }
  }

  async function getDataUser() {
    try {
      const currentUser = await getCurrentUser();
      const _user = currentUser?.data;
      if (_user) {
        setUser(_user);
        setRoles(_user?.role);
        setRules(_user?.roles?.[0]?.rules);
        setPermissions(_user?.roles?.[0]?.permissions);
      }
    } catch (err) {
      if (err?.status === 403) {
        await onLogout();
      }
      console.error('Error in getDataUser:', err);
    }
  }

  const onLogout = async () => {
    try {
      setLoading(true);
      Cookies.remove('userToken');
      try {
        await logout();
      } catch (error) {}
      localStorage.clear();
      setTenant(null);
      setUser(null);
      setLoading(false);
      navigate('/login');
    } catch (err) {
      console.error('Error in onLogout:', err);
      setUser(null);
      setLoading(false);
    }
  };

  const isNotLogin = location.pathname !== '/login';
  const isRegister = location.pathname === '/register';
  return (
    <AuthContext.Provider
      value={{
        user,
        jsonSchema,
        roles,
        rules,
        permissions,
        handleChangeTenant,
        tenant,
        setTenant,
        onLogout,
        initData: getInit,
        getJson,
        refreshSidebar,
        setRefreshSidebar,
        listTenant,
        setRoles,
        setUser,
      }}>
      {isNotLogin && !isRegister && !tenant && !localStorage.getItem('tenant') ? (
        <Tenant />
      ) : (loading || !user || !jsonSchema) && isNotLogin && !isRegister ? (
        <div className='flex flex-1 justify-center items-center h-screen w-screen absolute left-0 right-0 z-50'>
          <Image
            src='/images/loading.gif'
            alt=''
            width={300}
            height={300}
            className='w-auto h-[200px]'
          />
        </div>
      ) : (
        <Fragment key={JSON.stringify(tenant)}>{children}</Fragment>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
