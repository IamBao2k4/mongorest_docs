'use client';

import CardGallery from '../CardGallery';

import {
  excludeKeys,
  generateCategoryHash,
  parse,
  propagateDefinitionChanges,
  stringify,
} from '@/helpers/utils';
import { useStyles } from './styles';
import { DEFAULT_FORM_INPUTS } from '@/components/builders/fields/default';

export default function PredefinedGallery({ schema, uischema, onChange, mods }) {
  const classes = useStyles();
  const schemaData = parse(schema) || {};
  const uiSchemaData = parse(uischema) || {};
  const allFormInputs = excludeKeys(
    Object.assign({}, DEFAULT_FORM_INPUTS, (mods && mods.customFormInputs) || {}),
    mods && mods.deactivatedFormInputs
  );
  const categoryHash = generateCategoryHash(allFormInputs);

  React.useEffect(() => {
    if (!uiSchemaData.definitions) {
      const references = [];

      const findRefs = (name, schemaObject) => {
        if (!schemaObject) return;
        if (typeof schemaObject === 'object')
          Object.keys(schemaObject).forEach((key) => {
            if (typeof key === 'string') {
              if (key === '$ref') references.push(name);
              findRefs(key, schemaObject[key]);
            }
          });
        if (Array.isArray(schemaObject))
          schemaObject.forEach((innerObj) => {
            findRefs(name, innerObj);
          });
      };

      findRefs('root', schemaData);

      uiSchemaData.definitions = {};
      const referenceSet = new Set(references);
      Object.keys(uiSchemaData).forEach((uiProp) => {
        if (referenceSet.has(uiProp)) uiSchemaData.definitions[uiProp] = uiSchemaData[uiProp];
      });
      if (!Object.keys(uiSchemaData.definitions).length) {
        uiSchemaData.definitions = undefined;
      }
      onChange(stringify(schemaData), stringify(uiSchemaData));
    }
  }, [uischema, schema]);
  return (
    <div className={classes.preDefinedGallery}>
      <CardGallery
        definitionSchema={schemaData.definitions}
        definitionUiSchema={uiSchemaData.definitions}
        onChange={(newDefinitions, newDefinitionsUi) => {
          schemaData.definitions = newDefinitions;
          uiSchemaData.definitions = newDefinitionsUi;

          propagateDefinitionChanges(
            schemaData,
            uiSchemaData,
            (newSchema, newUiSchema) => onChange(stringify(newSchema), stringify(newUiSchema)),
            categoryHash
          );
        }}
        mods={mods}
        categoryHash={categoryHash}
      />
    </div>
  );
}
