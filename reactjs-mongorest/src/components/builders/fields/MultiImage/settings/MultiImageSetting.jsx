import { Checkbox } from '@/components/ui/Checkbox';
import React from 'react';

function MultiImageSetting({ parameters, onChange }) {
  const fields = parameters?.fields || [];
  return (
    <React.Fragment>
      <div className='flex flex-col gap-3'>
        {[
          { label: 'Image Main', key: 'main' },
          { label: 'Image Main Mobile', key: 'mainMb' },
          { label: 'Image Background', key: 'bg' },
          { label: 'Image Background Mobile', key: 'bgMb' },
        ].map((item) => {
          return (
            <div
              className='flex items-center space-x-2'
              key={item.key}>
              <Checkbox
                id={item.key}
                checked={fields.includes(item.key)}
                onCheckedChange={(checked) => {
                  return onChange({
                    ...parameters,
                    fields: checked ? [...fields, item.key] : fields.filter((f) => f !== item.key),
                  });
                }}
              />
              <label
                htmlFor={item.key}
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                {item.label}
              </label>
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
}
export default MultiImageSetting;
