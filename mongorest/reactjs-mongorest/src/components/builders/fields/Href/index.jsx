import { HrefEdit } from './components';

const Href = ({ schema, options, required, onChange, value, type = 'edit', ...props }) => {
  return (
    <div>
      <HrefEdit
        value={value || {}}
        onChange={onChange}
        schema={schema}
      />
    </div>
  );
};

export default Href;
