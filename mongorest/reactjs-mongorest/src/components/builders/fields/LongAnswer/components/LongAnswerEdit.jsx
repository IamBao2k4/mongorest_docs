import { TextEditor } from '@/components/builders/elements';
import { Textarea } from '@/components/ui/Textarea';

const LongAnswerEdit = ({ placeholder, onChange, value, defaultValue, row = 5, schema, ui }) => {
  return ui === 'textarea' ? (
    <Textarea
      placeholder={placeholder}
      value={value || ''}
      defaultValue={defaultValue}
      rows={row}
      disabled={schema?.isDisable}
      onChange={(ev) => onChange(ev.target.value)}
      style={{ borderRadius: 5.375 }}
      minLength={schema?.min}
      maxLength={schema?.max}
    />
  ) : (
    <TextEditor
      value={value || defaultValue || ''}
      onChange={(newValue) => {
        onChange?.(newValue);
      }}
      disable={schema?.isDisable}
    />
  );
};

export default LongAnswerEdit;
