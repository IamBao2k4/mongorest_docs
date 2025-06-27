import WrapperSetting from '@/components/builders/elements/WrapperSetting';

const formatTypeDictionary = {
  email: 'email',
  url: 'uri',
};

function ShortAnswerDefault({ parameters, onChange }) {
  return (
    <WrapperSetting
      title='Default Value'
      value={parameters.default}
      placeholder='Default'
      autoComplete={parameters['autocomplete']}
      type={formatTypeDictionary[parameters.format] || 'text'}
      onChange={(ev) => onChange({ ...parameters, default: ev.target.value })}
    />
  );
}

export default ShortAnswerDefault;
