import { useState } from 'react';
import DataOptions from './DataOptions';
import DataTabs from './DataTabs';
import { Switch } from '@/components/ui/Switch';
function capitalizeFirstLetter(string) {
  const _string = string.replace(/-/g, ' ');
  return _string.charAt(0).toUpperCase() + _string.slice(1);
}

function DataEdit({ value, onChange, schema }) {
  const [typeDefault, setTypeDefault] = useState('posttype');
  const [tabs, setTabs] = useState(value?.tabs || [{ type: 'entity' }]);

  const onChangeDataTab = (key, val, index) => {
    const newTabs = [...tabs];
    newTabs[index][key] = val;

    if (key === 'type') {
      setTypeDefault(val);
      newTabs.map((item) => {
        item.data = [];
        item.type = val;
      });
    }

    setTabs([...newTabs]);
    onChange({
      ...value,
      tabs: [...newTabs],
    });
  };

  const handleRemoveTab = (index) => {
    const _tabs = tabs.filter((_, i) => i !== index);
    setTabs([..._tabs]);
    onChange({
      ...value,
      tabs: [..._tabs],
    });
  };

  const optionSelect = (typeof schema?.optionSelect === 'string'
    ? schema?.optionSelect.split(', ')
    : schema?.optionSelect) || ['product-types', 'post-type', 'category', 'post', 'page-ai'];

  return (
    <div className='px-6 py-4 border-2 border-solid rounded-md border-green mt-2'>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col'>
          <p className='!font-medium'>Related</p>
          <p className='text-sm text-black/60 mb-2'>Chọn sản phẩm liên quan với trang hiện tại</p>
          <Switch
            checked={value?.related}
            onCheckedChange={(val) => onChange({ ...value, related: val })}
          />
        </div>
        <DataOptions
          value={value}
          onChange={onChange}
          schema={schema}
          capitalizeFirstLetter={capitalizeFirstLetter}
        />
        {!value?.related && (
          <DataTabs
            tabs={tabs}
            onChange={onChange}
            setTabs={setTabs}
            onChangeDataTab={onChangeDataTab}
            handleRemoveTab={handleRemoveTab}
            optionSelect={optionSelect}
            capitalizeFirstLetter={capitalizeFirstLetter}
            typeDefault={typeDefault}
          />
        )}
      </div>
    </div>
  );
}

export default DataEdit;
