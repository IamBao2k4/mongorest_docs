import { WrapperField } from '@/components/builders/elements';
const FunctionEdit = ({ id, schema, required, error, onChange, value, props }) => {
  return (
    <WrapperField
      title={schema?.title}
      description={schema?.description}
      required={required}
      error={error}></WrapperField>
  );
};
export default FunctionEdit;
