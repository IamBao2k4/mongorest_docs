import { WrapperField } from '@/components/builders/elements';

const FunctionTable = ({ id, schema, required, onChange, value, props }) => {
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
export default FunctionTable;
