'use client';

import {
  addSectionObj,
  addSelectCardObj,
  excludeKeys,
  generateCategoryHash,
  parse,
  stringify,
} from '@/helpers/utils';
import { Add, DragDrop } from '../elements';
import { cn } from '@/lib/utils';

export default function JsonBuilder({ schema, uischema, onChange, fields, type, className = '' }) {
  const schemaData = parse(schema) || {};
  schemaData.type = 'object';
  if (!schemaData?.properties) schemaData.properties = {};
  const uiSchemaData = parse(uischema) || {};
  const allFormInputs = excludeKeys(Object.assign({}, fields));

  const categoryHash = generateCategoryHash(allFormInputs);

  const properties = {
    schema: schemaData,
    uischema: uiSchemaData,
    onChange: (newSchema, newUiSchema) => {
      onChange(stringify(newSchema), stringify(newUiSchema));
    },
    definitionData: schemaData.definitions,
    definitionUi: uiSchemaData.definitions,
    categoryHash,
    mods: {},
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <DragDrop
        properties={properties}
        schemaData={schemaData}
        uiSchemaData={uiSchemaData}
        allFormInputs={allFormInputs}
        fields={fields}
        type={type}
      />
      <Add
        fields={fields}
        type={type}
        addElem={(choice, type) => {
          if (choice === 'card')
            addSelectCardObj(
              {
                ...properties,
              },
              type
            );
          else
            addSectionObj({
              ...properties,
            });
        }}
        path='root'
      />
    </div>
  );
}
