'use client';

import ContainerForm from '@/components/common/ContainerForm';
import { Button } from '@/components/ui/Button';
import { get_path_img } from '@/helpers/get_path_img';
import { mediaApi } from '@/services/media';
import useServiceDetail from '@/hooks/useServiceDetail';
import { useEffect, useState } from 'react';
import { Spin } from '@/components/ui/Spin';
import { PopConfirm } from '@/components/ui/PopConfirm';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet';
import { Image } from '@/components/ui/Image';
import { Copy } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';

const FormImage = ({
  idMedia = '',
  setIdMedia = () => {},
  onUpdateAgain = () => {},
  changeFormImage = () => {},
  setGetDataAgain,
}) => {
  const { toast } = useToast();
  const params = useParams();
  const { deleteMedia } = mediaApi(params.lang);
  const [isOpen, setIsOpen] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [mediaLoading, setMediaLoading] = useState(false);

  const onCloseModal = (refesh) => {
    setIsOpen(false);
    setIdMedia('');
    refesh && onUpdateAgain();
    setErrors(null);
  };

  const {
    onSubmit: onUpdate,
    loading: loadingUpdate,
    formData,
    schema,
    errors,
    setErrors,
    onChangeFormData,
  } = useServiceDetail({ entity: 'media', id: idMedia, isRedirect: false, notInitData: true });

  useEffect(() => {
    if (idMedia) {
      setIsOpen(true);
    } else {
    }
  }, [idMedia]);

  const onDeleteOne = async (data) => {
    const result = await deleteMedia({
      ids: data,
    });
    if (result) {
      toast({ description: 'delete_success' });
      setGetDataAgain(true);
      setIdMedia(null);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (formData && formData.path && formData.path.endsWith('.md')) {
      setMediaLoading(true);
      fetch(formData.path)
        .then((response) => response.text())
        .then((text) => {
          setMarkdownContent(text);
        })
        .catch((error) => {
          console.error('Error fetching markdown file:', error);
        })
        .finally(() => {
          setMediaLoading(false);
        });
    }
  }, [formData]);

  const renderTypeMedia = (value) => {
    if (value?.path?.includes('.pdf')) {
      return (
        <div className='w-full h-full overflow-y-auto relative'>
          {mediaLoading && (
            <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10'>
              <Spin spinning={true} />
            </div>
          )}
          <iframe
            src={get_path_img(value)}
            className='w-full h-full'
            title={value?.filename || 'PDF Viewer'}
            onLoad={() => setMediaLoading(false)}
            onLoadStart={() => setMediaLoading(true)}
          />
        </div>
      );
    }

    if (value?.path?.includes('.mp3')) {
      return (
        <div className='relative'>
          {mediaLoading && (
            <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10'>
              <Spin spinning={true} />
            </div>
          )}
          <audio
            controls
            onLoadStart={() => setMediaLoading(true)}
            onCanPlay={() => setMediaLoading(false)}
            onError={() => setMediaLoading(false)}>
            <source
              src={get_path_img(value)}
              type={value?.mime}
            />
          </audio>
        </div>
      );
    }

    if (value?.path?.includes('.mp4')) {
      return (
        <div className='relative'>
          {mediaLoading && (
            <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10'>
              <Spin spinning={true} />
            </div>
          )}
          <video
            className='w-full h-[85vh]'
            controls
            onLoadStart={() => setMediaLoading(true)}
            onCanPlay={() => setMediaLoading(false)}
            onError={() => setMediaLoading(false)}>
            <source
              src={get_path_img(value)}
              type={value?.mime}
            />
          </video>
        </div>
      );
    }

    if (value?.path?.includes('.md')) {
      return (
        <div className='w-full h-[85vh] overflow-y-auto relative'>
          {mediaLoading && (
            <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10'>
              <Spin spinning={true} />
            </div>
          )}
          <Markdown>{markdownContent}</Markdown>
        </div>
      );
    }

    if (value?.path?.includes('.txt')) {
      return (
        <div className='w-full h-[85vh] overflow-y-auto relative'>
          {mediaLoading && (
            <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10'>
              <Spin spinning={true} />
            </div>
          )}
          <object
            data={get_path_img(value)}
            width='300'
            height='200'
            onLoad={() => setMediaLoading(false)}>
            Not supported
          </object>
        </div>
      );
    }

    return (
      <div className='relative w-full h-96'>
        {mediaLoading && (
          <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10'>
            <Spin spinning={true} />
          </div>
        )}
        <Image
          className='object-contain'
          src={get_path_img(value)}
          alt=''
          fill
          onLoadingComplete={() => setMediaLoading(false)}
          onLoadStart={() => setMediaLoading(true)}
          onError={() => setMediaLoading(false)}
        />
      </div>
    );
  };

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(formData?.path);
      toast({ title: 'Copy thành công' });
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) {
          onCloseModal(val);
        } else {
          setIsOpen(val);
        }
      }}>
      <SheetContent
        className={cn(
          'overflow-hidden flex flex-col',
          formData?.path?.endsWith('.md') ? 'sm:min-w-[90%]' : 'sm:max-w-[70%] '
        )}>
        <div className='flex justify-between items-center'>
          <SheetHeader>
            <SheetTitle>File</SheetTitle>
            <SheetDescription>Chỉnh sửa thông tin file</SheetDescription>
          </SheetHeader>
          <div className={'flex gap-2 items-center'}>
            {formData?.path ? <Copy onClick={handleCopyClick} /> : null}

            <Button
              type='button'
              onClick={() => onCloseModal(false)}>
              Hủy
            </Button>
            <PopConfirm
              onConfirm={() => {
                onDeleteOne(formData?.id);
                onCloseModal(true);
              }}>
              <Button type='button'>Xóa</Button>
            </PopConfirm>
            <Button
              type='button'
              loading={loadingUpdate}
              onClick={async () => {
                const result = await onUpdate(formData);
                if (result) {
                  onCloseModal(true);
                  changeFormImage(idMedia, result);
                }
              }}>
              Xác nhận
            </Button>
          </div>
        </div>

        {formData && (
          <Spin spinning={loadingUpdate}>
            <div
              className='flex gap-2'
              gutter={32}
              align={'middle'}>
              <div
                className={cn('pr-5', formData?.path?.endsWith('.md') ? 'w-[80%]' : 'w-1/2')}
                key={formData?.path}>
                {renderTypeMedia(formData)}
              </div>
              <div className={cn('flex-1', formData?.path?.endsWith('.md') ? 'w-[20%]' : 'w-1/2')}>
                <ContainerForm
                  entity={'media'}
                  schema={schema}
                  onChangeFormData={onChangeFormData}
                  formData={formData}
                  errors={errors}
                />
              </div>
            </div>
          </Spin>
        )}
      </SheetContent>
    </Sheet>
  );
};
export default FormImage;
