import { useAuth } from '@/context/AuthContext';

export const withRelation = (WrappedComponent) => {
  return ({ value, inforFields, ...props }) => {
    const { jsonSchema } = useAuth();
    if (
      inforFields?.key &&
      jsonSchema?.[inforFields?.key]?.settings &&
      Array.isArray(value) &&
      value.length > 0
    ) {
      const _setting = jsonSchema[inforFields.key]?.settings;
      const _value = JSON.parse(JSON.stringify(value));
      value = _value.map((item) => {
        Object.keys(_setting).forEach((key) => {
          item[key] = item[_setting[key]];
        });
        return item;
      });
    }
    return (
      <WrappedComponent
        {...props}
        value={value}
        inforFields={inforFields}
      />
    );
  };
};
