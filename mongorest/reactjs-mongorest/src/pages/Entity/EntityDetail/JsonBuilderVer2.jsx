import { DEFAULT_FORM_INPUTS } from '@/components/builders/fields/default';
import SchemaTreeEditor from '@/components/common/JsonConvert/SchemaBuilder/SchemaTreeEditor';
import parse from '@/helpers/strToObject';
import {
  convertJSONToUI,
  convertToSchema,
  excludeKeys,
  generateCategoryHash,
} from '@/helpers/utils';
import { useEffect, useState } from 'react';

function JsonBuilderVer2({ schemaBuilder, setSchemaBuider }) {
  const schemaData = parse(schemaBuilder?.json) || {};
  schemaData.type = 'object';
  if (!schemaData?.properties) schemaData.properties = {};

  const uiSchemaData = parse(schemaBuilder?.ui);

  const allFormInputs = excludeKeys(Object.assign({}, DEFAULT_FORM_INPUTS));
  const categoryHash = generateCategoryHash(allFormInputs);

  const properties = {
    schema: schemaData,
    uischema: uiSchemaData,
    onChange: (newSchema, newUiSchema) => {
      handleSchemaChange(stringify(newSchema), stringify(newUiSchema));
    },
    definitionData: schemaData?.definitions,
    definitionUi: uiSchemaData?.definitions,
    categoryHash,
    mods: {},
  };

  const [mainTreeData, setMainTreeData] = useState([]);

  function handleUpdateSchema(data) {
    const newSchemaData = convertToSchema(data[0]);
    const newUischemaData = convertJSONToUI(newSchemaData);

    setSchemaBuider({
      json: JSON.stringify(newSchemaData),
      ui: JSON.stringify(newUischemaData),
    });
  }

  useEffect(() => {
    if (mainTreeData.length > 0) {
      handleUpdateSchema(mainTreeData);
    }
  }, [mainTreeData]);

  return (
    <SchemaTreeEditor
      setMainTreeData={setMainTreeData}
      properties={properties}
      schemaData={JSON.parse(JSON.stringify(schemaData))}
      uiSchemaData={JSON.parse(JSON.stringify(uiSchemaData))}
      schemaBuilder={schemaBuilder}
      setSchemaBuider={setSchemaBuider}
      definitionData={schemaData?.definitions}
      definitionUi={uiSchemaData?.definitions}
      categoryHash={categoryHash}
      allFormInputs={allFormInputs}
      fields={DEFAULT_FORM_INPUTS}
      type='posttype'
      handleUpdateSchema={handleUpdateSchema}
    />
  );
}

export default JsonBuilderVer2;
