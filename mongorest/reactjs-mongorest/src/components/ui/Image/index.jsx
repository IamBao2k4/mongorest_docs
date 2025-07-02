import { get_path_img } from '@/helpers/get_path_img';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

export const Image = ({ src, fill, className, ...props }) => {
  const [imgSrc, setImgSrc] = useState(get_path_img(src));

  const handleError = () => {
    setImgSrc('/images/notFound.jpg');
  };

  return (
    <img
      {...props}
      className={cn(className, fill && 'h-full w-full object-cover absolute inset-0')}
      src={imgSrc}
      onError={handleError}
      alt={props.alt || 'image'}
    />
  );
};
