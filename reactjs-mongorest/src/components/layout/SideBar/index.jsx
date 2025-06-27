import { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import clsx from 'clsx';
import Cookies from 'js-cookie';
import {
  Atom,
  Box,
  Boxes,
  Component,
  Crown,
  Images,
  ListChecks,
  LogOut,
  MonitorDown,
  Network,
  ServerCrash,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Locale from './Locale';

const menu = [
  {
    title: 'Entity',
    type: 'entity',
    icon: <Atom className='size-4 text-default-black' />,
  },
  {
    title: 'Group Field',
    type: 'group-field',
    icon: <Box className='size-4 text-default-black' />,
  },
  {
    title: 'Collection',
    type: 'collection',
    icon: <Boxes className='size-4 text-default-black' />,
  },
  {
    title: 'Role',
    type: 'role',
    icon: <Crown className='size-4 text-default-black' />,
  },
  {
    title: 'Media',
    type: 'media',
    icon: <Images className='size-4 text-default-black' />,
  },
  {
    title: 'User',
    type: 'user',
    icon: <Box className='size-4 text-default-black' />,
  },
  {
    title: 'Tenant',
    type: 'tenant',
    icon: <Network className='size-4 text-default-black' />,
  },
  {
    title: 'Download',
    type: 'download',
    icon: <MonitorDown className='size-4 text-default-black' />,
  },
  {
    title: 'API Setting',
    type: 'role-settings',
    icon: <ServerCrash className='size-4 text-default-black' />,
  },

  {
    title: 'Validate',
    type: 'validate',
    icon: <ListChecks className='size-4 text-default-black' />,
  },
  {
    title: 'Role API',
    type: 'role-settings',
    icon: <ListChecks className='size-4 text-default-black' />,
  },
  {
    title: 'Response',
    type: 'response',
    icon: <ListChecks className='size-4 text-default-black' />,
  },
];

function Sidebar({ className, courseDetail, children }) {
  const [show, setShow] = useState(true);
  const { user, jsonSchema } = useAuth();
  const history = useHistory();

  const _permission = user?.role?.[0]?.permission || [];

  return (
    <>
      <div className={clsx('border-r border-r-[#D4D6D999] h-screen fixed z-50', className)}>
        <div
          className={clsx(
            'overflow-hidden transition-all duration-200 z-10 flex flex-col h-full',
            show ? 'w-[256px]' : 'w-0'
          )}>
          <div className='px-4 py-[10px] border-b border-b-[#D4D6D999] h-[45px]'>
            <Link
              to='/'
              className='shrink-0'>
              <img
                src='/images/logo-mangoads.png'
                className='h-6 w-auto object-contain'
              />
            </Link>
          </div>
          <div className='flex flex-col px-2 py-2 gap-1 h-full'>
            {menu.map((item, index) => {
              const indexPermission = _permission.findIndex((i) => i.entity === item.type);

              if (
                user?.role_system !== 'admin' &&
                (indexPermission === -1 ||
                  !_permission[indexPermission]?.filter?.includes('get-all'))
              )
                return null;

              return (
                <Link
                  key={index}
                  to={'/' + item.type}
                  className='flex items-center gap-2 px-2 rounded-md py-1 hover:bg-[#D4D6D999] cursor-pointer'>
                  <div className='shrink-0 pb-[2px]'>{item.icon}</div>
                  <span className='text-sm text-default-black !leading-[80%]'>{item.title}</span>
                </Link>
              );
            })}
            <p className='text-sm text-default-black !leading-[80%] px-2 pt-5 pb-2 font-medium'>
              Danh sách Entity
            </p>
            <div className='flex flex-col gap-[6px] flex-1 overflow-hidden hover:overflow-y-auto mb-[100px]'>
              {Object.keys(jsonSchema).map((key, index) => {
                const item = jsonSchema[key];

                if (!item?.title) return null;

                const indexPermission = _permission.findIndex(
                  (i) => i.entity === item.mongodb_collection_name
                );

                if (
                  user?.role_system !== 'admin' &&
                  (indexPermission === -1 ||
                    !_permission[indexPermission]?.filter?.includes('get-all'))
                )
                  return null;

                return (
                  <Link
                    to={`/${item.mongodb_collection_name}`}
                    key={index}
                    className='flex items-center gap-2 pr-2 pl-7 rounded-md py-1 hover:bg-[#D4D6D999] cursor-pointer'>
                    <div className='shrink-0 pb-[2px]'>
                      <Component className='size-4 text-default-black' />
                    </div>
                    <span className='text-sm text-default-black line-clamp-1'>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className='h-[45px] border-t border-t-[#D4D6D999] flex items-center justify-between cursor-pointer absolute bottom-0 inset-x-0'>
            <div
              className='px-4'
              onClick={() => {
                Cookies.remove('userToken');
                history.push('/login');
                localStorage.removeItem('tenant');
              }}>
              <LogOut className='size-4 text-default-black' />
            </div>
            <Locale />
          </div>
        </div>
      </div>
      <div
        className={clsx(
          'w-full h-full transition-all duration-200 flex justify-center',
          show ? 'pl-[256px]' : 'pl-[64px]'
        )}>
        <div className='w-full overflow-hidden'>{children}</div>
      </div>
    </>
  );
}

export default Sidebar;
