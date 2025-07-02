import WrapperSetting from '@/components/builders/elements/WrapperSetting';
import TextEditor from '..';

const elementSetting = {
  title: 'Default value',
  typeField: 'textarea',
  key: 'default',
  placeholder: 'Default',
};

function LongAnswerDefault({ parameters, onChange }) {
  return (
    <>
      {parameters.customRole === 'textarea' ? (
        <div>
          <WrapperSetting
            title={elementSetting.title}
            typeField={elementSetting.typeField}
            value={parameters.default}
            placeholder={elementSetting.placeholder}
            onChange={(val) => onChange({ ...parameters, default: val.target.value })}
          />
        </div>
      ) : (
        <div>
          <h5
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              lineHeight: '21px',
              textAlign: 'left',
            }}>
            Default value
          </h5>
          <TextEditor
            value={parameters.default}
            onChange={(newValue) => {
              onChange({ ...parameters, default: newValue });
            }}
          />
        </div>
      )}
    </>
  );
}

export default LongAnswerDefault;
