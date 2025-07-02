import { Switch } from '@/components/ui/Switch';

const BooleanFilter = ({ defaultChecked = false, onChange, checked, disabled }) => {
  return (
    <Switch
      defaultChecked={defaultChecked}
      checked={checked}
      onCheckedChange={(checked) => {
        onChange(checked);
      }}
      disabled={disabled}
    />
  );
};

export default BooleanFilter;
