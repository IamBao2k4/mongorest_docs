import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Link } from '@/components/ui/Link';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/Sidebar';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';
import { ChevronsUpDown, LogOut, PanelsLeftBottom } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher/index.jsx';

export const NavUser = () => {
  const { user } = useAuth();
  const history = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove('userToken');
    localStorage.removeItem('tenant');
    history('/login');
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <LanguageSwitcher />
      </SidebarMenuItem>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${
                isOpen ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
              }`}
              onClick={() => setIsOpen(!isOpen)}>
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage
                  src={user.avatar}
                  alt={user.name}
                />
                <AvatarFallback className='rounded-lg'>{user.username}</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>{user.username}</span>
                <span className='truncate text-xs'>{user.email}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-full min-w-56 rounded-lg'
            align='end'>
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage
                    src={user.avatar}
                    alt={user.name}
                  />
                  <AvatarFallback className='rounded-lg'>{user.username}</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{user.name}</span>
                  <span className='truncate text-xs'>{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user && user?.role_system === 'admin' && (
              <Link to='/settings'>
                <DropdownMenuItem className='cursor-pointer'>
                  <PanelsLeftBottom /> Configure sidebar
                </DropdownMenuItem>
              </Link>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='cursor-pointer'
              onClick={handleLogout}>
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
