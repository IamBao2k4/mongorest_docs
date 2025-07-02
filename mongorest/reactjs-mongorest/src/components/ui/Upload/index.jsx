'use client';

import { mediaApi } from '@/services/media';
import { UploadIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const Upload = ({
  uploadLocal,
  isMulti = true,
  cb = null,
  children,
  isDragger,
  width,
  height,
  beforeUpload,
  onError,
  ...props
}) => {
  const { search } = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(search);
  const { createMedia } = mediaApi();
  const [loading, setLoading] = useState(false);
  const onDrop = async (acceptedFiles) => {
    setLoading(true);
    try {
      const promiseArr = acceptedFiles.map((file) => {
        beforeUpload?.(file);
        if (uploadLocal) return;
        const dataPost = [
          {
            alt: file.name,
            title: file.name,
            file: file,
            ...(searchParams.get('search[categories.id:in]')
              ? {
                  categories: [searchParams.get('search[categories.id:in]')],
                }
              : {}),
          },
        ];
        return createMedia({
          data: dataPost,
        });
      });
      if (uploadLocal) return;
      const result = await Promise.all(promiseArr);

      if (result.length) {
        toast({ description: 'upload_file_success' });
        cb && cb();
      }
    } catch (err) {
      console.log('🚀 ~ onDrop ~ err:', err);
      onError?.({ err });
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: isMulti,
  });

  return (
    <div className='relative z-0'>
      {isDragger ? (
        <div
          {...getRootProps({
            className:
              'dropzone bg-[#fafafa] border border-[#d9d9d9] hover:border-[#092136] cursor-pointer border-dashed rounded-lg p-4 py-5',
          })}>
          <input {...getInputProps()} />
          <div className='flex flex-col items-center justify-center'>
            <p className='ant-upload-drag-icon'>
              <UploadIcon className='w-10 h-10' />
            </p>
            <p className='ant-upload-text text-slate-700 mt-3'>
              Nhấp hoặc kéo tệp vào khu vực này để tải lên
            </p>
            <p className='ant-upload-hint text-slate-500 text-xs mt-2'>
              Hỗ trợ tải lên một lần hoặc hàng loạt. Nghiêm cấm tải lên dữ liệu của công ty hoặc các
              tệp bị cấm khác.
            </p>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps({
            className:
              'dropzone bg-[#fafafa] border border-[#d9d9d9] hover:border-[#092136] cursor-pointer border-dashed rounded-lg flex items-center justify-center overflow-hidden',
          })}
          style={{ width: width || 100, height: height || 100 }}>
          <input {...getInputProps()} />
          <div className='flex flex-col items-center justify-center'>{children}</div>
        </div>
      )}
      {loading && (
        <div className='absolute inset-0 bg-white/80 w-full h-full flex items-center justify-center z-10'>
          <Loader2 className='animate-spin h-6 w-6' />
        </div>
      )}
    </div>
  );
};
