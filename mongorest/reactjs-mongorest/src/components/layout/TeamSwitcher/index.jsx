'use client';

import { ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/Command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/components/ui/Link';

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { tenant, handleChangeTenant, listTenant } = useAuth();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <div className='flex items-center'>
            <Link
              href='/en'
              className='flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground'>
              <img
                src='/images/icon.png'
                className='size-4'
                alt='Logo'
              />
            </Link>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{tenant.title}</span>
                </div>
                <ChevronsUpDown className='ml-auto' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}>
            <Command>
              <CommandInput placeholder='Type a command or search...' />
              <CommandList className='max-h-[400px] overflow-auto'>
                {listTenant.map((item) => {
                  return (
                    <CommandItem
                      className='cursor-pointer select-auto'
                      key={item.value}
                      onSelect={() => handleChangeTenant(item.value)}>
                      {item.label}
                    </CommandItem>
                  );
                })}
              </CommandList>
            </Command>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
