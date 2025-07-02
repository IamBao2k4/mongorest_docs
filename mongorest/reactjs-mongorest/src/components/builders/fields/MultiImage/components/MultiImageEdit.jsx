import { WrapperField } from '@/components/builders/elements';
import { FileEdit } from '../../File/components';

const MultiImageEdit = ({ id, schema, required, onChange, value, props }) => {
  const _val = value || {};

  const handleChange = (data, key) => {
    const _data = { ..._val, [key]: data };
    onChange(_data);
  };
  return (
    <WrapperField
      title={schema?.title}
      required={required}
      description={schema?.description}>
      <div className='grid grid-cols-4 gap-4'>
        {[
          { label: 'Image Main', key: 'main' },
          { label: 'Image Main Mobile', key: 'mainMb' },
          { label: 'Image Background', key: 'bg' },
          { label: 'Image Background Mobile', key: 'bgMb' },
        ]
          .filter((item) => schema?.fields?.includes(item.key))
          .map((item) => {
            return (
              <FileEdit
                value={_val[item.key]}
                onChange={(val) => handleChange(val, item.key)}
                schema={{ title: item.label, description: 'Chọn hình' }}
              />
            );
          })}
      </div>
    </WrapperField>
  );
};
export default MultiImageEdit;
