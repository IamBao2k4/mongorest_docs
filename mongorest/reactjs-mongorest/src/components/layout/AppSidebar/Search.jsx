import { Input } from '@/components/ui/Input';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/Sidebar';
import clsx from 'clsx';
import { X, Search as SearchIcon } from 'lucide-react';
import { useRef } from 'react';

function Search({ textSearch, setTextSearch }) {
  const { open, toggleSidebar } = useSidebar();
  const ref = useRef(null);

  return (
    <>
      <div
        className={clsx('relative transition-all px-2', open ? 'opacity-100' : 'opacity-0')}
        data-sidebar='menu-item'>
        <Input
          ref={ref}
          className='h-7 text-xs pr-8 w-full'
          placeholder='Search...'
          value={textSearch}
          onChange={(e) => setTextSearch(e.target.value)}
        />
        {textSearch ? (
          <div className='p-1 absolute right-2 top-0 bottom-0 h-full flex items-center z-10'>
            <div
              className='p-2 cursor-pointer'
              onClick={() => setTextSearch('')}>
              <X className='size-3' />
            </div>
          </div>
        ) : null}
      </div>
      {!open ? (
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                style={{ width: '100%' }}
                onClick={() => {
                  toggleSidebar();
                  ref.current.focus();
                }}>
                <SearchIcon className='size-5' />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      ) : null}
    </>
  );
}

export default Search;
