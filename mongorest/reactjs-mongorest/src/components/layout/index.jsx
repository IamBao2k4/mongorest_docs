import { SidebarInset, SidebarProvider } from '@/components/ui/Sidebar';
import { AppSidebar } from './AppSidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

export default function Layout() {
  const { pathname } = useLocation();
  const [openSidebar, setOpenSidebar] = useState(true);
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;

    if (pathname.startsWith('/page-ai/')) {
      // Vào trang /page-ai/ thì đóng sidebar
      setOpenSidebar(false);
    } else if (prevPathname.startsWith('/page-ai/') && !pathname.startsWith('/page-ai/')) {
      // Từ /page-ai/ chuyển sang trang khác (không phải /page-ai/) thì mở lại sidebar
      setOpenSidebar(true);
    }

    // Cập nhật pathname trước đó
    prevPathnameRef.current = pathname;
  }, [pathname]);

  return (
    <SidebarProvider
      open={openSidebar}
      onOpenChange={setOpenSidebar}>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
