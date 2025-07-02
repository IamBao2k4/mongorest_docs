import { WrapperField } from '@/components/builders/elements';

const ColorTable = ({ id, schema, required, onChange, value, props }) => {
  return (
    <WrapperField
      title={schema?.title}
      description={schema?.description}
      required={required}
      error={error}>
      <p>ád</p>
    </WrapperField>
  );
};
export default ColorTable;
