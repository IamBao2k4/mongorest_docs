import clsx from 'clsx';

export default function LayoutGridField(props) {
  try {
    const { uiSchema, registry, formData, schema, idSchema, name } = props;
    const { fields, templates } = registry;
    const { GridTemplate = DefaultGridTemplate } = templates;

    const layoutGrid = uiSchema['ui:layoutGrid'];

    const renderLayoutItem = (item, index) => {
      try {
        // Handle ui:row
        if (item['ui:row']) {
          const { className = '', children = [] } = item['ui:row'];
          return (
            <GridTemplate
              key={index}
              column={false}
              className={clsx(className)}>
              {children.map((child, childIndex) =>
                renderLayoutItem(child, `${index}-${childIndex}`)
              )}
            </GridTemplate>
          );
        }

        // Handle ui:col
        if (item['ui:col']) {
          const { className = '', children = [] } = item['ui:col'];
          return (
            <GridTemplate
              key={index}
              column={true}
              className={clsx(className, 'grid')}>
              {children.map((child, childIndex) => {
                if (typeof child === 'string') {
                  return renderField(child, `${index}-${childIndex}`);
                } else if (child && typeof child === 'object') {
                  return renderLayoutItem(child, `${index}-${childIndex}`);
                }
                return null;
              })}
            </GridTemplate>
          );
        }

        if (item['ui:columns']) {
          const { className = '', children = [] } = item['ui:columns'];
          return children.map((child, childIndex) => {
            if (typeof child === 'string') {
              return (
                <GridTemplate
                  key={`${index}-${childIndex}`}
                  column={true}
                  className={className}>
                  {renderField(child, `${index}-${childIndex}`)}
                </GridTemplate>
              );
            }
            return null;
          });
        }

        return null;
      } catch (error) {
        return (
          <div
            key={index}
            className='p-2 border border-red-300 bg-red-50 rounded'>
            Error rendering item: {error.message}
          </div>
        );
      }
    };

    const renderField = (fieldName, key) => {
      try {
        const fieldSchema = schema?.properties?.[fieldName];
        const fieldUiSchema = uiSchema[fieldName] || {};

        if (!fieldSchema) {
          console.warn(`Field schema not found for: ${fieldName}`, {
            availableFields: schema?.properties ? Object.keys(schema.properties) : 'none',
          });
          return (
            <div
              key={key}
              className='p-2 border border-yellow-300 bg-yellow-50 rounded'>
              Field '{fieldName}' not found in schema
            </div>
          );
        }

        const FieldComponent = fields?.SchemaField;

        if (!FieldComponent) {
          console.error('SchemaField not found in registry.fields', {
            availableFields: fields ? Object.keys(fields) : 'no fields',
          });
          return (
            <div
              key={key}
              className='p-2 border border-red-300 bg-red-50 rounded'>
              SchemaField component not found
            </div>
          );
        }

        // Create proper field props
        const fieldProps = {
          key,
          name: fieldName,
          schema: fieldSchema,
          uiSchema: fieldUiSchema,
          formData: formData?.[fieldName],
          idSchema: {
            $id: `${idSchema?.$id || 'root'}__${fieldName}`,
            ...idSchema,
          },
          registry,
          onChange: props.onChange,
          onBlur: props.onBlur,
          onFocus: props.onFocus,
          disabled: props.disabled,
          readonly: props.readonly,
          autofocus: props.autofocus,
          rawErrors: props.rawErrors,
          errorSchema: props.errorSchema,
        };

        console.log(`Field ${fieldName} props:`, {
          schema: fieldSchema,
          uiSchema: fieldUiSchema,
          formData: formData?.[fieldName],
        });

        return <FieldComponent {...fieldProps} />;
      } catch (error) {
        console.error('Error rendering field:', error, fieldName);
        return (
          <div
            key={key}
            className='p-2 border border-red-300 bg-red-50 rounded'>
            Error rendering field '{fieldName}': {error.message}
          </div>
        );
      }
    };

    // Render the main layout grid
    const mainRow = layoutGrid['ui:row'];
    if (mainRow) {
      const { className = '', children = [] } = mainRow;
      return (
        <div className='layout-grid-container'>
          <GridTemplate
            column={false}
            className={className}>
            {children.map((child, index) => renderLayoutItem(child, index))}
          </GridTemplate>
        </div>
      );
    }

    console.error('Invalid layout grid configuration - no ui:row found', layoutGrid);
    return (
      <div className='p-4 border border-red-300 bg-red-50 rounded'>
        Invalid layout grid configuration: no ui:row found
      </div>
    );
  } catch (error) {
    return (
      <div className='p-4 border border-red-300 bg-red-50 rounded'>
        <h3 className='font-semibold text-red-800'>LayoutGridField Error:</h3>
        <p className='text-red-600'>{error.message}</p>
        <details className='mt-2'>
          <summary className='cursor-pointer text-sm text-red-500'>Stack trace</summary>
          <pre className='text-xs mt-1 p-2 bg-red-100 rounded overflow-auto'>{error.stack}</pre>
        </details>
      </div>
    );
  }
}
