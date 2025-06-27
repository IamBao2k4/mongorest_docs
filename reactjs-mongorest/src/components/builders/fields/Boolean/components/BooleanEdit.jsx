import { WrapperField } from '@/components/builders/elements';
import { Checkbox } from '@/components/ui/Checkbox';
import { Switch } from '@/components/ui/Switch';
import { ENUM_TYPE_BOOLEAN } from '@/data/enum';

const BooleanEdit = ({
  defaultChecked = false,
  onChange,
  checked,
  disabled,
  typeBoolean,
  title,
  required,
  description,
}) => {
  if (typeBoolean === ENUM_TYPE_BOOLEAN.checkbox) {
    return (
      <WrapperField
        title={title}
        required={required}
        description={description}>
        <Checkbox
          disabled={disabled}
          checked={checked}
          onCheckedChange={(checked) => onChange(checked)}>
          {title}
        </Checkbox>
        <span>{description}</span>
      </WrapperField>
    );
  } else
    return (
      <WrapperField
        title={title}
        required={required}
        description={description}>
        <Switch
          defaultChecked={defaultChecked}
          checked={checked}
          onCheckedChange={(checked) => {
            onChange(checked);
          }}
          disabled={disabled}
        />
      </WrapperField>
    );
};

export default BooleanEdit;
