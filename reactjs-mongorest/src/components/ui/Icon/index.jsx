'use client';

import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

export function Icon({ name, className, ...props }) {
  const { tenant } = useAuth();
  return (
    <img
      className={clsx(className)}
      src={`/icons/${tenant._id}/${name}.svg`}
      alt='icon'
      {...props}
    />
  );
}
