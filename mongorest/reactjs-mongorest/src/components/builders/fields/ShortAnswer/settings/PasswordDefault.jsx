import WrapperSetting from '@/components/builders/elements/WrapperSetting';

const elementSetting = {
  title: 'Default password',
  typeField: 'password',
  key: 'default',
  placeholder: 'Default',
};

export default function PasswordDefault({ parameters, onChange }) {
  return (
    <>
      <div className='grid grid-cols-2'>
        <div className='col-span-1'>
          <WrapperSetting
            title={elementSetting.title}
            typeField={elementSetting.typeField}
            autoComplete={parameters['autocomplete']}
            placeholder={elementSetting.placeholder}
            value={parameters.default}
            onChange={(e) => onChange({ ...parameters, [elementSetting.key]: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}
