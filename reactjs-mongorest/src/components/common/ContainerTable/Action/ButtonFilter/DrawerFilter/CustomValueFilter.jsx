import { Fields } from '@/components/builders/fields/fields';
import DrawerFilter from '.';
import { useAuth } from '@/context/AuthContext';
import { Select } from '@/components/ui/Select';

export const Populate = ({ fieldData, handleOnChange, value }) => {
  const { jsonSchema } = useAuth();
  let advance =
    fieldData.widget === 'relation' ? jsonSchema[fieldData?.typeRelation?.title]?.filter : null;

  if (!advance) return;
  advance = advance.map((item, index) => {
    return {
      ...item,
      name: item.key,
      title: item.key,
      field: item.key,
      label: item.key,
      datatype: index,
    };
  });

  return (
    <DrawerFilter
      query={value}
      setQuery={(e) => {
        handleOnChange(e);
      }}
      header={advance}
      enableDragAndDrop={false}
      isShowCheckbox={true}
    />
  );
};
const CustomValueFilter = ({ fieldData, value, handleOnChange, context, operator, ...props }) => {
  const { header, advance } = context;
  if (!fieldData || !header[fieldData?.datatype]?.component) return;
  const f = header[fieldData.datatype];
  const Comp = Fields[header[fieldData.datatype].component];

  return (
    <div className='render-field-query w-full overflow-hidden'>
      <div className='flex gap-2 w-full'>
        {operator === 'populate' ? (
          <Populate
            fieldData={fieldData}
            handleOnChange={handleOnChange}
            value={typeof value === 'string' && value.startsWith('$') ? null : value}
            key={value}
          />
        ) : (
          <Comp
            type='filter'
            value={typeof value === 'string' && value.startsWith('$') ? null : value}
            onChange={(val) => handleOnChange(val)}
            schema={{ ...f }}
          />
        )}
        {advance && Array.isArray(advance) && advance?.length > 0 ? (
          <div>
            <Select
              className='w-[200px]'
              groupOptions={true}
              value={value && typeof value === 'string' && value.startsWith('$') ? value : null}
              onValueChange={(val) => handleOnChange(val)}
              items={advance}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CustomValueFilter;
