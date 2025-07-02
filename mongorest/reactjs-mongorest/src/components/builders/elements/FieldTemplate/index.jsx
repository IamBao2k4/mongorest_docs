import nestedProperty from 'nested-property';

function FieldTemplate(props) {
  const {
    id,
    children,
    schema,
    formContext: { errors },
    name,
    idSchema,
  } = props;

  const getFieldError = () => {
    const fieldPath = id.replace('root_', '');

    // Generate all possible paths
    const possiblePaths = [
      fieldPath, // "newInput2_newInput1"
      fieldPath.replace(/_/g, '.'), // "newInput2.newInput1"
      name, // direct name
      idSchema?.$id?.replace('root_', ''), // from idSchema
      fieldPath.split('_')[0], // parent field
    ].filter(Boolean);

    // Also try with different separators and formats
    if (fieldPath.includes('_')) {
      const parts = fieldPath.split('_');
      possiblePaths.push(
        parts.join('.'), // "newInput2.newInput1"
        `${parts[0]}[${parts[1]}]`, // "newInput2[newInput1]"
        `${parts[0]}.${parts.slice(1).join('.')}` // handle deeper nesting
      );
    }

    // Use nested-property to safely get values
    for (const path of possiblePaths) {
      if (nestedProperty.has(errors, path)) {
        const errorValue = nestedProperty.get(errors, path);
        return errorValue;
      }
    }

    return null;
  };

  const fieldError = getFieldError();
  const hasError = !!fieldError;

  return (
    <div
      key={id}
      className={`mb-4 ${hasError ? 'has-error' : ''}`}>
      {children}
      {hasError && (
        <div className='mt-1'>
          <p className='text-red-500 text-sm flex items-center font-semibold'>
            {typeof fieldError === 'string' ? fieldError : JSON.stringify(fieldError)}
          </p>
        </div>
      )}
    </div>
  );
}

export default FieldTemplate;
