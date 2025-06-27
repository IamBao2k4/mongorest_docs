import React from 'react';
import WrapperSetting from '@/components/builders/elements/WrapperSetting';

const elementSetting = {
  title: 'Do not choose a past date',
  typeField: 'boolean',
  key: 'show_past',
};

const DateAndTimeSetting = (props) => {
  const { onChange, parameters } = props;

  return (
    <div>
      <div className='grid grid-cols-2'>
        <div className='col-span-1'>
          <WrapperSetting
            title={elementSetting.title}
            typeField={elementSetting.typeField}
            checked={Boolean(parameters.show_past)}
            onCheckedChange={(val) => {
              onChange({ ...parameters, ['show_past']: val });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DateAndTimeSetting;
