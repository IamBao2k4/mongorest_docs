'use client';

import { Container } from '@/components/ui/Container';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import clsx from 'clsx';
import { lazy, useEffect, useMemo, useRef, useState } from 'react';
import HeaderCard from './HeaderCard';
import Main from './Main';
const Footer = lazy(() => import('./Footer'));
const NoData = lazy(() => import('./NoData'));

export default function CardContainer({
  title,
  description,
  limit = 3,
  type,
  modePaging,
  tabs,
  layout,
  lang,
  dataDefault,
  metaDefault,
  id,
  filter,
  href,
  slidePerView,
  tabFilterCategories,
  tagGroup,
  showCategoriesFilter,
  showBreadcrumb,
  initDataByParams,
  img,
  isFilter,
  detailPage,
  related,
  ...props
}) {
  const keysFilter = ['search[session_tags::tags:inall]', 'search[categories.id:is]', 'page'];
  let searchParams;

  if (typeof window !== 'undefined') {
    searchParams = new URLSearchParams(window.location.search);
  }
  const defaultFilter = useMemo(() => {
    const s = {
      limit,
    };
    return s;
  }, []);

  const [dataState, setDataState] = useState(null);

  const [metaState, setMetaState] = useState(null);
  const { isMobile } = useDeviceDetect();
  const [filterState, setFilterState] = useState(() => {
    const _f = {};
    keysFilter.map((item) => {
      if (searchParams && searchParams.get(item)) {
        if (item === 'page' && modePaging === 'pagination') {
          if (modePaging === 'pagination') _f[item] = searchParams.get(item);
        } else _f[item] = searchParams.get(item);
      }
    });
    return Object.keys(_f).length > 0 ? _f : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLoadmore, setIsLoadingLoadmore] = useState(false);

  const headingRef = useRef(null);
  const dataType = tabs?.[0];
  const previousPage = useRef(1);

  useEffect(() => {
    if (Object.keys(filter || {})?.length > 0) setFilterState(filter ?? {});
  }, [filter]);

  useEffect(() => {
    if (filterState) {
      getDataPageChange();
    }
  }, [filterState]);

  const onChangePage = async (page) => {
    previousPage.current = page - 1;
    if (
      modePaging === 'pagination' ||
      (modePaging === 'slider' && isMobile && headingRef.current)
    ) {
      headingRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    setFilterState((pre) => ({ ...pre, page }));
  };

  async function getDataPageChange() {
    if (modePaging !== 'loadMore') setIsLoading(true);
    else setIsLoadingLoadmore(true);
    try {
      const get_data_relation = (await import('@/helpers/get_data_relation')).get_data_relation;

      const _filter = filterState ? { ...defaultFilter, ...filterState } : { ...defaultFilter };

      const result = await get_data_relation({
        filter: _filter,
        type: dataType?.type,
        data: dataType?.data,
        lang,
        related,
        status: 'client',
        detailPage,
      });
      setMetaState(result?.meta);

      if (modePaging === 'loadMore') {
        //NOTE: Page trước và page hiện tại bằng nhau => thay đổi filter => set lại data
        if (previousPage.current === filterState?.page || filterState?.page == 1) {
          setDataState([...result.data]);
        } else {
          dataState
            ? setDataState([...dataState, ...result.data])
            : setDataState([...dataDefault, ...result.data]);
        }
      } else {
        setDataState(result?.data);
      }

      if (modePaging !== 'loadMore') setIsLoading(false);
      else setIsLoadingLoadmore(false);
    } catch (err) {
      if (modePaging !== 'loadMore') setIsLoading(false);
      else setIsLoadingLoadmore(false);
      console.error('🚀 ~ getDataPageChange err: ', err);
    }
  }

  const data = dataState || dataDefault || [];
  const mainProps = useMemo(
    () => ({
      data,
      layout,
      loading: isLoading,
      limit,
      slidePerView,
      mode: modePaging,
      lang,
      isFilter: Boolean(isFilter),
      ...props,
    }),
    [dataState, isLoading, dataDefault]
  );

  return (
    <section
      id={id}
      ref={headingRef}
      className={clsx('relative')}>
      <Container
        className={clsx('relative')}
        as='div'>
        <div
          className={clsx(
            'relative',
            layout === '5' && 'flex w-full flex-col items-start md:flex-row lg:gap-9'
          )}>
          <HeaderCard
            title={title}
            description={description}
            layout={layout}
            mode={modePaging}
            href={href}
            dataType={dataType}
            type={type}
            isFilter={isFilter}
            filterState={filterState}
            setFilterState={setFilterState}
          />
          {data?.length > 0 ? (
            <Main
              {...mainProps}
              key={JSON.stringify(data)}
              layout={layout}
              href={href}
              dataType={dataType}
            />
          ) : (
            <NoData />
          )}
          <Footer
            mode={modePaging}
            meta={metaState || metaDefault}
            onChangePage={onChangePage}
            limit={limit ?? Number(metaDefault?.per_page) ?? 1}
            page={filterState?.page ?? 1}
            loading={isLoading}
            type={type}
            dataType={dataType}
            href={href}
            isLoadingLoadmore={isLoadingLoadmore}
          />
        </div>
      </Container>
    </section>
  );
}
