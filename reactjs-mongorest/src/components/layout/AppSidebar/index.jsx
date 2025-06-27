import { Link } from '@/components/ui/Link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/Sidebar';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';
import {
  AlignJustify,
  Atom,
  Box,
  Boxes,
  Crown,
  Images,
  MonitorDown,
  Network,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { NavMain } from '../NavMain';
import { NavUser } from '../NavUser';
import { TeamSwitcher } from '../TeamSwitcher';
import Search from './Search';

export function AppSidebar({ ...props }) {
  const { user, jsonSchema, tenant } = useAuth();
  const [textSearch, setTextSearch] = useState('');
  const _indexTenant = user?.role?.findIndex((item) => tenant?._id === item?.tenant_id?._id);
  const _permission = user?.role?.[_indexTenant]?.permission || [];

  const _menus = menu.filter((item) => {
    const indexPermission = _permission.findIndex((i) => `/${i.entity}` === item.url);
    if (user?.role_system !== 'admin') {
      if (
        indexPermission === -1 ||
        !['get-all', 'get-all-self'].some((permission) =>
          _permission[indexPermission]?.filter?.includes(permission)
        )
      )
        return false;
      if (['/entity', '/entity-group'].includes(item.url)) return false;
    }

    return true;
  });

  const _list = Object.keys(jsonSchema)
    .filter((key) => {
      const item = jsonSchema[key];
      if (!item?.title) return null;
      const indexPermission = _permission.findIndex(
        (i) => i.entity === item.mongodb_collection_name
      );
      if (
        user?.role_system !== 'admin' &&
        (indexPermission === -1 ||
          !['get-all', 'get-all-self'].some((permission) =>
            _permission[indexPermission]?.filter?.includes(permission)
          ))
      )
        return null;
      if (['entity', 'entity-group'].includes(key)) return false;
      return true;
    })
    .map((key) => {
      const item = jsonSchema[key];
      return {
        title: item.title,
        url: `/${item.mongodb_collection_name}`,
        key: item.mongodb_collection_name,
      };
    });

  const resSearch = textSearch
    ? [..._menus, ..._list]
        .filter((item) => item.title.toLowerCase().includes(textSearch.toLowerCase()))
        .filter((item, index, self) => index === self.findIndex((t) => t.url === item.url))
    : [];

  return (
    <Sidebar
      collapsible='icon'
      {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <Search
          textSearch={textSearch}
          setTextSearch={setTextSearch}
        />
        {textSearch ? (
          <SidebarMenu>
            {resSearch.map((item, index) => {
              return (
                <SidebarMenuItem key={item.title + index}>
                  <SidebarMenuButton
                    className={clsx('hover:bg-slate-100')}
                    tooltip={item.title}
                    asChild>
                    <Link href={item.url}>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        ) : (
          <NavMain
            items={[..._menus]}
            listEntity={_list.filter(
              (item) => menu.findIndex((i) => i.title === item.title) === -1
            )}
          />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export const menu = [
  {
    title: 'Entity',
    url: '/entity',
    icon: Atom,
    key: 'entity',
  },
  {
    title: 'Group Field',
    url: '/group-field',
    icon: Box,
    key: 'group-field',
  },
  {
    title: 'Collection',
    url: '/collection',
    icon: Boxes,
    key: 'collection',
  },
  {
    title: 'Role',
    url: '/role',
    icon: Crown,
    key: 'role',
  },
  {
    title: 'API Key',
    url: '/api-key',
    icon: Crown,
    key: 'api-key',
  },
  {
    title: 'Media',
    url: '/media',
    icon: Images,
    key: 'media',
  },
  {
    title: 'Menu',
    url: '/menu',
    icon: AlignJustify,
    key: 'menu',
  },
  {
    title: 'Templates',
    url: '/templates',
    icon: AlignJustify,
    key: 'templates',
  },
  {
    title: 'User',
    url: '/user',
    icon: User,
    key: 'user',
  },
  {
    title: 'Tenant',
    url: '/tenant',
    icon: Network,
    key: 'tenant',
  },
  {
    title: 'Layout',
    url: '/layout',
    icon: MonitorDown,
    key: 'layout',
  },
];
