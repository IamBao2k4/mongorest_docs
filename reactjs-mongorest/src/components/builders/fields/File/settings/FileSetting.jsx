import WrapperSetting from '@/components/builders/elements/WrapperSetting';
import React from 'react';

const choose = [
  {
    label: 'All',
    value: 'all',
    key: 'all',
  },
  {
    label: 'Uploaded to post',
    value: 'uploaded_to_post',
    key: 'uploaded_to_post',
  },
];

const arraySettings = [
  {
    title: 'Modal title',
    key: 'instructions',
    placeholder: 'Image',
  },
  {
    title: 'File type',
    key: 'image_type',
    placeholder: 'image/png,image/gif,image/jpeg',
    description: 'Comma separated list. Leave blank for all types',
  },
  {
    title: 'Libary',
    typeField: 'choose',
    choose: choose,
    key: 'library_setting',
    description: 'Limit the media library choice',
  },
  {
    title: 'Description types',
    key: 'meta',
    placeholder: 'Recommend file image',
  },
];

function FileSetting({ parameters, onChange }) {
  return (
    <React.Fragment>
      <div className='grid grid-cols-2 gap-5'>
        {arraySettings.map((item, index) => (
          <div
            key={item.key}
            className='col-span-1'>
            <WrapperSetting
              title={item.title}
              description={item.description}
              typeField={item.typeField}
              choose={item.choose}
              placeholder={item.placeholder}
              value={
                item.key === 'image_type'
                  ? parameters.image_type || 'image/*'
                  : parameters[item.key]
              }
              onChange={(val) => {
                if (item.key === 'library_setting') {
                  onChange({ ...parameters, library_setting: val });
                } else {
                  onChange({ ...parameters, [item.key]: val.target.value });
                }
              }}
            />
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}
export default FileSetting;
