'use client';

import { Bot, ChevronRight, Router } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/Sidebar';
import { Link } from '@/components/ui/Link';
import clsx from 'clsx';
import { useCommon } from '@/context/CommonContext';
import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

// Constants
const API_ITEMS = [
  { title: 'API Setting', url: '/role-settings', key: 'role-settings' },
  { title: 'MCP tool', url: '/mcp', key: 'mcp' },
  { title: 'Flow Setting', url: '/workflow-settings', key: 'workflow-settings' },
  { title: 'Validate', url: '/validate', key: 'validate' },
  { title: 'Response', url: '/response', key: 'response' },
  { title: 'Notification', url: '/notification', key: 'notification' },
  { title: 'Documents', url: '/documents', key: 'documents' },
  { title: 'Task', url: '/task', key: 'task' },
];

const AI_ITEMS = [
  { title: 'Page AI', url: '/page-ai', key: 'page-ai' },
  { title: 'Generate Data AI', url: '/generate-data-ai', key: 'generate-data-ai' },
  { title: 'Flow AI', url: '/flow-api', key: 'flow-api' },
  { title: 'Prompt Design', url: '/prompt-design', key: 'prompt-design' },
];

export function NavMain({ items, listEntity }) {
  const { pathname } = useLocation();
  const { settingSidebar } = useCommon();
  const { jsonSchema, tenant } = useAuth();

  const sidebarTenantKeys = tenant?.sidebar;

  const isActiveItem = useMemo(() => (url) => `/${pathname.split('/')[1]}` === url, [pathname]);
  const POSTTYPE_ITEMS = Object.keys(jsonSchema)
    .filter((key) => {
      return (
        jsonSchema[key]?.type === 'post-type'
        // && (!sidebarTenantKeys || sidebarTenantKeys.includes(key))
      );
    })
    .map((key) => ({
      title: jsonSchema[key]?.title,
      url: `/${jsonSchema[key]?.mongodb_collection_name}`,
      key: jsonSchema[key]?.mongodb_collection_name,
    }));

  const filterHiddenItems = useMemo(
    () => (items) =>
      items.filter((item) => !sidebarTenantKeys || sidebarTenantKeys.includes(item.key)),
    [settingSidebar?.hidden]
  );

  const filteredItems = useMemo(() => filterHiddenItems(items), [items, filterHiddenItems]);

  const renderMenuItem = (item) => {
    const isActive = isActiveItem(item.url);
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          className={clsx('hover:bg-slate-100', isActive && 'bg-slate-300')}
          tooltip={item.title}
          asChild>
          <Link href={item.url}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderSubMenuItem = (subItem) => {
    const isActive = isActiveItem(subItem.url);
    return (
      <SidebarMenuSubItem key={subItem.url}>
        <SidebarMenuSubButton
          asChild
          className={clsx('hover:bg-slate-100', isActive && 'bg-slate-300')}>
          <Link href={subItem.url}>
            <span>{subItem.title}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  };

  const renderCollapsibleGroup = (title, icon, items, defaultOpen = true) => {
    const _items =
      title === 'Posttype'
        ? POSTTYPE_ITEMS
        : items.filter((item) => !sidebarTenantKeys || sidebarTenantKeys.includes(item.key));

    if (_items?.length > 0)
      return (
        <Collapsible
          asChild
          defaultOpen={defaultOpen}
          className='group/collapsible'>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={title}
                className='hover:bg-slate-100'>
                {icon}
                <span>{title}</span>
                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>{_items.map(renderSubMenuItem)}</SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );

    return <></>;
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Features</SidebarGroupLabel>
        <SidebarMenu>
          {filteredItems.map((item) => {
            if (!item?.children) return renderMenuItem(item);

            const filteredChildren = filterHiddenItems(item.children);
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className='group/collapsible'>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className='hover:bg-slate-100'>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>{filteredChildren.map(renderSubMenuItem)}</SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
          {POSTTYPE_ITEMS.length > 0 &&
            renderCollapsibleGroup('Posttype', <Router />, POSTTYPE_ITEMS)}
          {renderCollapsibleGroup('API', <Router />, API_ITEMS)}
          {renderCollapsibleGroup('AI', <Bot />, AI_ITEMS)}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
        <SidebarGroupLabel>Entity</SidebarGroupLabel>
        <SidebarMenu>
          {renderCollapsibleGroup('List Entity', <Bot />, listEntity || [], false)}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
