'use client';

import { mediaApi } from '@/services/media';
import { Editor } from '@tinymce/tinymce-react';
import { useEffect, useState } from 'react';
const initConfig = {
  selector: 'textarea#format-html5',
  images_upload_handler: async (blobInfo) => {
    const { createMedia } = mediaApi();

    return new Promise((resolve, reject) => {
      const data = [
        {
          alt: blobInfo.name(),
          title: blobInfo.name(),
          file: blobInfo.blob(),
        },
      ];
      createMedia({ data })
        .then((res) => {
          resolve(
            `${import.meta.env.VITE_MINIO_CDN}/${import.meta.env.VITE_MINIO_BUCKET}/${res?.data?.filename}`
          );
        })
        .catch((e) => {
          reject(e);
        });
    });
  },
  file_picker_types: 'image',
  automatic_uploads: true,
  quickbars_insert_toolbar: 'quicktable image media',
  toolbar:
    'undo redo | blocks | fontsize bold italic | forecolor backcolor | alignleft aligncenter alignright alignjustify | indent outdent | bullist numlist',
  content_style:
    'body { font-family:Helvetica,Arial,sans-serif; font-size:16px; height: 400px; overflow-y: auto !important; }',
  powerpaste_allow_local_images: true,
  autosave_ask_before_unload: false,
  height: 500,
  font_size_formats: '80px 50px 35px 34px 33px 30px 22px 20px 17px 16px 15px 14px 13px 12px',
  promotion: false,
  entity_encoding: 'raw',
  init_instance_callback: 'insert_contents',
};

const TextEditor = ({ value = '', onChange = () => {}, disable = false, config = {} }) => {
  const [init, setInit] = useState(value);
  useEffect(() => {
    setInit(value);
  }, [value]);

  return (
    <>
      <Editor
        tinymceScriptSrc={'/tinymce/tinymce.min.js'}
        plugins={'quickbars table image link lists media wordcount code autoresize'}
        value={init}
        outputFormat='html'
        onEditorChange={(newValue) => {
          setInit(newValue);
          onChange(newValue);
        }}
        disabled={disable}
        init={{ ...initConfig, ...config }}
      />
    </>
  );
};
export default TextEditor;
