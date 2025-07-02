import WrapperSetting from '@/components/builders/elements/WrapperSetting';

const elementSetting = {
  title: 'Default generate path',
  key: 'depend_field',
  placeholder: 'root_newInput1',
};

export default function SlugDefault({ parameters, onChange }) {
  return (
    <div>
      <WrapperSetting
        title={elementSetting.title}
        placeholder={elementSetting.placeholder}
        value={parameters?.[elementSetting.key]}
        onChange={(val) => onChange({ ...parameters, [elementSetting.key]: val.target.value })}
      />
    </div>
  );
}
