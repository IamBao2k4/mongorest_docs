import WrapperSetting from '@/components/builders/elements/WrapperSetting';
import React, { Fragment } from 'react';

const formatDictionary = [
  {
    label: 'Money',
    value: 'monney',
  },
];

const arraySettings = [
  {
    title: 'Min',
    typeField: 'number',
    key: 'min',
  },
  {
    title: 'Max',
    typeField: 'number',
    key: 'max',
  },
  {
    title: 'Placeholder',
    typeField: 'input',
    key: 'placeholder',
  },
  {
    title: 'Step',
    typeField: 'number',
    key: 'step',
  },
  {
    title: 'Label Start',
    typeField: 'input',
    key: 'labelStart',
  },
  {
    title: 'Label End',
    typeField: 'input',
    key: 'labelEnd',
  },
  {
    title: 'Only Vi',
    typeField: 'boolean',
    key: 'onlyVi',
  },
  {
    title: 'Format',
    options: formatDictionary,
    key: 'format-data',
  },
  {
    title: 'Unit',
    typeField: 'input',
    key: 'unit',
  },
];
function NumberInputSetting({ parameters, onChange }) {
  return (
    <div className='grid grid-cols-2 gap-5'>
      {parameters.widget === 'range' ? (
        <Fragment>
          {arraySettings.map((item, index) => (
            <div
              key={index}
              className='col-span-1'>
              <WrapperSetting
                title={item.title}
                typeField={item.typeField}
                value={parameters[`${item.key}`] ? parameters[`${item.key}`] : ''}
                optionsLevel1={item.options}
                checked={item.key === 'onlyVi' ? parameters?.onlyVi : ''}
                onCheckedChange={(val) => {
                  if (item.key === 'onlyVi') {
                    onChange({ ...parameters, onlyVi: val });
                  }
                }}
                onChange={(val) => {
                  switch (item.key) {
                    case 'min':
                      return onChange({ ...parameters, min: parseFloat(val.target.value) });

                    case 'max':
                      return onChange({ ...parameters, max: parseFloat(val.target.value) });

                    case 'autocomplete':
                      return onChange({ ...parameters, autocomplete: val });

                    case 'format-data':
                      return onChange({ ...parameters, 'format-data': val });

                    default:
                      return onChange({ ...parameters, [item.key]: val.target.value });
                  }
                }}
              />
            </div>
          ))}
        </Fragment>
      ) : (
        <Fragment>
          {arraySettings
            .filter(
              (prev) =>
                prev.key !== 'step' &&
                prev.key !== 'labelStart' &&
                prev.key !== 'labelEnd' &&
                prev.key !== 'onlyVi'
            )
            .map((item, index) => (
              <div
                key={index}
                className='col-span-1'>
                <WrapperSetting
                  title={item.title}
                  typeField={item.typeField}
                  value={parameters[`${item.key}`] ? parameters[`${item.key}`] : ''}
                  optionsLevel1={item.options}
                  checked={item.key === 'onlyVi' ? parameters?.onlyVi : ''}
                  onCheckedChange={(val) => {
                    if (item.key === 'onlyVi') {
                      onChange({ ...parameters, onlyVi: val });
                    }
                  }}
                  onChange={(val) => {
                    switch (item.key) {
                      case 'min':
                        return onChange({ ...parameters, min: parseFloat(val.target.value) });

                      case 'max':
                        return onChange({ ...parameters, max: parseFloat(val.target.value) });

                      case 'autocomplete':
                        return onChange({ ...parameters, autocomplete: val });

                      case 'format-data':
                        return onChange({ ...parameters, 'format-data': val });

                      default:
                        return onChange({ ...parameters, [item.key]: val.target.value });
                    }
                  }}
                />
              </div>
            ))}
        </Fragment>
      )}
    </div>
  );
}

export default NumberInputSetting;
