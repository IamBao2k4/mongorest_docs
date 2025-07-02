import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { importApi } from '@/services/upload';
import { Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function ButtonImport({ entity, getData }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | null
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const validateFile = (file) => {
    // Kiểm tra định dạng file
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv', // .csv (alternative MIME type)
    ];

    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        message: 'Chỉ chấp nhận file Excel (.xlsx, .xls)',
      };
    }

    return { isValid: true };
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await importApi().importPosttype({
        params: {
          post_type: entity?._id,
          product_type: entity?.product_type?.[0]?.slug,
        },
        data: formData,
      });

      await getData();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset trạng thái
    setUploadStatus(null);
    setUploadMessage('');

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setUploadStatus('error');
      setUploadMessage(validation.message);
      return;
    }

    // Bắt đầu upload
    setIsUploading(true);

    try {
      const result = await uploadFile(file);

      if (result.success) {
        setUploadStatus('success');
        setUploadMessage('Upload file thành công!');
        console.log('Upload result:', result.data);
      } else {
        setUploadStatus('error');
        setUploadMessage(`Lỗi upload: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Có lỗi xảy ra khi upload file');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      // Reset input để có thể chọn lại cùng file
      event.target.value = '';
    }
  };

  useEffect(() => {
    if (uploadMessage) {
      toast({
        title: 'Upload',
        description: uploadMessage,
        variant: uploadStatus === 'success' ? 'default' : 'destructive',
      });
    }
  }, [uploadMessage]);

  return (
    <div className='space-y-2'>
      <Button
        variant='outline'
        className='gap-2 border-none shadow-none'
        onClick={handleFileSelect}
        disabled={isUploading}>
        <Upload className='size-4' />
        <span className='sr-only sm:not-sr-only sm:whitespace-nowrap text-sm text-default-black'>
          Import
        </span>
      </Button>

      <input
        ref={fileInputRef}
        type='file'
        accept='.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
        onChange={handleFileChange}
        className='hidden'
      />
    </div>
  );
}

export default ButtonImport;
