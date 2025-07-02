import nestedProperty from 'nested-property';
import { getApiConfigValue } from '.';

const listParams = [
  { label: 'Limit', value: 'limit' },
  { label: 'Page', value: 'page' },
];

const excludeParams = ['page', 'limit'];

const FormParams = ({ parameters, onChange, index, customParams, dataApi }) => {
  const params = nestedProperty.get(parameters, getApiConfigValue(index, 'params')) || {};
  return (
    <>
      <p>Mapping Params</p>
      <div className='flex flex-col gap-2'>
        {listParams.map((item) => {
          return (
            <div className='flex items-center gap-2'>
              <p className='mb-0'>{item.label}</p>
              {/* <RenderField
                title={item.label}
                input={
                  <Input
                    value={params?.[item?.value] || item?.value}
                    className='max-w-xs'
                    onChange={(val) => {
                      nestedProperty.set(
                        parameters,
                        getApiConfigValue(index, 'params.' + item.value, val.target.value)
                      );
                      onChange({
                        ...parameters,
                      });
                    }}
                  />
                }
                description=''
              /> */}
            </div>
          );
        })}
        {Object.keys(customParams).map((key) => {
          if (excludeParams.includes(key)) return;
          const isReference = Boolean(
            nestedProperty.get(
              parameters,
              getApiConfigValue(index, 'params.' + key + '.is:reference')
            )
          );
          return {
            /* <RenderField
              title={key}
              input={
                <div className='flex items-center gap-3'>
                  {!isReference && (
                    <Input
                      value={
                        nestedProperty.get(
                          parameters,
                          getApiConfigValue(index, 'params.' + key + '.default')
                        ) || customParams[key]
                      }
                      className='max-w-xs'
                      onChange={(e) => {
                        const value = e.target.value;
                        nestedProperty.set(
                          parameters,
                          getApiConfigValue(index, 'params.' + key + '.default'),
                          value
                        );
                        onChange({
                          ...parameters,
                        });
                      }}
                    />
                  )}
                  {isReference && dataApi && index != 0 && (
                    <Cascader
                      options={mapObjectToAntOptions(dataApi)}
                      placeholder='Please select'
                      onChange={(value) => {
                        if (!Array.isArray(value)) return;
                        const selectedDataIsArray =
                          value.length > 0 && Array.isArray(dataApi?.[value[0]]);
                        const removedValue = [...value];

                        nestedProperty.set(
                          parameters,
                          getApiConfigValue(index, 'params.' + key + '.root_id'),
                          removedValue.shift()
                        );
                        if (selectedDataIsArray) {
                          nestedProperty.set(
                            parameters,
                            getApiConfigValue(index, 'params.' + key + '.type'),
                            'array'
                          );
                        }
                        nestedProperty.set(
                          parameters,
                          getApiConfigValue(index, 'url'),
                          replaceQueryParam(
                            nestedProperty.get(parameters, getApiConfigValue(index, 'url')),
                            key,
                            `{{${removedValue.join('.')}}}`
                          )
                        );
                        onChange({
                          ...parameters,
                        });
                      }}
                      changeOnSelect
                      displayRender={(label) => label.join('.')}
                    />
                  )}
                  {index != 0 &&
                    nestedProperty.get(
                      parameters,
                      getApiConfigValue(index, 'params.' + key + '.type')
                    ) === 'array' && (
                      <Switch
                        defaultChecked={nestedProperty.get(
                          parameters,
                          getApiConfigValue(index, 'params.' + key + '.loop')
                        )}
                        onChange={(value) => {
                          nestedProperty.set(
                            parameters,
                            getApiConfigValue(index, 'params.' + key + '.loop'),
                            value
                          );
                          onChange({
                            ...parameters,
                          });
                        }}
                        unCheckedChildren='Single'
                        checkedChildren='Loop'
                      />
                    )}
                  {index !== 0 && (
                    <Checkbox
                      defaultChecked={nestedProperty.get(
                        parameters,
                        getApiConfigValue(index, 'params.' + key + '.is:reference')
                      )}
                      onChange={(value) => {
                        nestedProperty.set(
                          parameters,
                          getApiConfigValue(index, 'params.' + key + '.is:reference'),
                          value.target.checked
                        );
                        onChange({
                          ...parameters,
                        });
                      }}
                    />
                  )}
                </div>
              }
            /> */
          };
        })}
      </div>
    </>
  );
};

export default FormParams;
