'use client';

import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import React from 'react';
import BreadcrumbSkeleton from '@/components/common/ContainerForm/FormSkeleton/BreadcrumbSkeleton';
import Cookies from 'js-cookie';
import { POSTTYPES } from 'constants';
import { useParams, usePathname } from 'next/navigation';

const Breadcrumb = ({ title, loading }) => {
  const params = useParams();
  const pathname = usePathname();

  let path = '';

  if (params.pid) {
    const p = POSTTYPES?.find((item) => item.slug === params.pid);
    path = {
      title: p?.title,
      slug: `post/${params.pid}/posts`,
    };
  } else {
    path = {
      title: pathname.split('/')[1],
      slug: pathname.split('/')[1],
    };
  }
  const getCookiesFilter = (url) => {
    if (Cookies.get(url) && JSON.parse(Cookies.get(url))) {
      let getFilter = JSON.parse(Cookies.get(url));
      return getFilter;
    } else return {};
  };
  return !loading ? (
    <div className='text-xl flex gap-2 text-[rgba(0,0,0,.45)]'>
      <Link
        href={'/'}
        className='flex gap-2 text-[rgba(0,0,0,.45)]'>
        <HomeOutlined />
        <p className='mb-0'>Trang chủ</p>
      </Link>
      <p className='mb-0'>/</p>
      <Link
        onClick={() => Cookies.remove(`/${path?.slug}`)}
        href={{
          pathname: `/${path?.slug}`,
          query: getCookiesFilter(`/${path?.slug}`),
        }}
        className='flex gap-2 text-[rgba(0,0,0,.45)]'>
        <p className='mb-0 capitalize'>{path?.title}</p>
      </Link>
      <p className='mb-0'>/</p>
      <p className='mb-0 text-black'>{title || 'New'}</p>
    </div>
  ) : (
    <BreadcrumbSkeleton />
  );
};

export default Breadcrumb;
