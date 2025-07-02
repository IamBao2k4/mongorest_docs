import { Input } from '@/components/ui/Input';

function SlugEdit({ placeholder, value, options, onChange, isDisabled }) {
  return (
    <Input
      style={{ borderRadius: 5.375 }}
      placeholder={placeholder}
      value={value}
      disabled={isDisabled}
      autoComplete={options?.autocomplete}
      onChange={(ev) => onChange(ev.target.value)}
    />
  );
}

export default SlugEdit;
