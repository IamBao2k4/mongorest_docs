import WrapperSetting from '@/components/builders/elements/WrapperSetting';

function HrefSetting({ parameters, onChange }) {
  const elementSetting = {
    title: 'Default value',
    typeField: 'boolean',
    key: 'hiddenTitle',
  };
  return (
    <>
      <div className='grid grid-cols-2'>
        <div className='col-span-1'>
          <WrapperSetting
            title={elementSetting.title}
            typeField={elementSetting.typeField}
            checked={parameters?.hiddenTitle}
            onCheckedChange={(val) => {
              onChange({ ...parameters, hiddenTitle: val });
            }}
          />
        </div>
      </div>
    </>
  );
}

export default HrefSetting;
