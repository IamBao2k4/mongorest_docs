import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Link } from '@/components/ui/Link';
import { Separator } from '@/components/ui/Separator';
import { SidebarTrigger } from '@/components/ui/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { PlusCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useProject } from '@/context/ProjectContext';

export default function PageHeader({ entity, title, showTester, showAddNew = true, extraActions }) {
  const location = useLocation();
  const pathname = location.pathname;
  const { lang } = useProject();
  const { jsonSchema } = useAuth();
  const _entity = entity || pathname.split('/')?.[1];
  const _entitiTitle = jsonSchema?.[_entity]?.title || _entity?.replace(/_|-/g, ' ');
  const { t } = useTranslation();
  const capitalizeTitle = (title) => {
    return title
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  useEffect(() => {
    if (_entitiTitle) {
      const formattedTitle = capitalizeTitle(_entitiTitle);
      document.title = formattedTitle;
    }
  }, []);

  return (
    <header className='flex shrink-0 items-center gap-2 border-b bg-background p-4 h-[45px]'>
      <SidebarTrigger className='-ml-1 size-5' />
      <Separator
        orientation='vertical'
        className='mr-2 h-4'
      />
      <Breadcrumb className='flex-1'>
        <BreadcrumbList>
          <BreadcrumbItem className='hidden md:block'>
            <BreadcrumbLink
              href='/'
              className='capitalize'>
              {t('home')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {_entitiTitle && (
            <>
              <BreadcrumbSeparator className='hidden md:block' />
              <BreadcrumbItem>
                <BreadcrumbLink
                  className='capitalize'
                  href={`/${jsonSchema?.[_entity]?.mongodb_collection_name}`}>
                  {_entitiTitle}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {title && (
            <>
              <BreadcrumbSeparator className='hidden md:block' />
              <BreadcrumbItem>
                <BreadcrumbPage className='capitalize'>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      {showAddNew &&
      pathname.split('/')?.length === (lang === 'vi' ? 2 : 3) &&
      !['/role-settings', '/settings'].includes(pathname) &&
      pathname !== '/' ? (
        <Link href={`${pathname}/new`}>
          <Button className='gap-1 h-8'>
            <PlusCircle className='h-3.5 w-3.5' />
            <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Add new</span>
          </Button>
        </Link>
      ) : (
        <></>
      )}
      {extraActions}
    </header>
  );
}
