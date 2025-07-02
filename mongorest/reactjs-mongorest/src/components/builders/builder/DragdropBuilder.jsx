'use client';

import { DragDropContext } from 'react-beautiful-dnd';
import {
  countElementsFromSchema,
  excludeKeys,
  generateCategoryHash,
  generateElementPropsFromSchemas,
  onDragEnd,
  parse,
  stringify,
  updateSchemas,
} from '@/helpers/utils';
import ColBuilder from './ColBuilder';
import { DEFAULT_FORM_INPUTS } from '@/components/builders/fields/default';
import { useState } from 'react';

export default function DragdropBuilder({
  schema,
  uischema,
  onChange,
  schemaRight,
  uischemaRight,
  onChangeRight,
  mods,
  className,
}) {
  const schemaData = parse(schema) || {};

  schemaData.type = 'object';
  const uiSchemaData = parse(uischema) || {};
  const schemaRightData = parse(schemaRight) || {};

  schemaData.type = 'object';
  const uiSchemaRightData = parse(uischemaRight) || {};
  const allFormInputs = excludeKeys(
    Object.assign({}, DEFAULT_FORM_INPUTS, (mods && mods.customFormInputs) || {}),
    mods && mods.deactivatedFormInputs
  );

  const elementNum = countElementsFromSchema(schemaData);
  const [cardOpenArray, setCardOpenArray] = useState(
    [...Array(elementNum).keys()].map(() => false)
  );

  const elementNumRight = countElementsFromSchema(schemaRightData);
  const defaultCollapseStatesRight = [...Array(elementNumRight).keys()].map(() => false);
  const [cardOpenArrayRight, setCardOpenArrayRight] = useState(defaultCollapseStatesRight);

  const categoryHash = generateCategoryHash(allFormInputs);
  const onDragEndCustom = (result, details) => {
    if (!result.destination) return;
    const {
      schema,
      uischema,
      onChange,
      definitionData,
      definitionUi,
      schemaRight,
      uischemaRight,
      onChangeRight,
      definitionDataRight,
      definitionUiRight,
      categoryHash,
    } = details;
    const src = result.source.index;
    const dest = result.destination.index;
    const srcDrop = result.source.droppableId;
    const destDrop = result.destination.droppableId;

    const data = {
      'col-left': {
        schema,
        uischema,
        onChange,
        definitionData,
        definitionUi,
      },
      'col-right': {
        schema: schemaRight,
        uischema: uischemaRight,
        onChange: onChangeRight,
        definitionData: definitionDataRight,
        definitionUi: definitionUiRight,
      },
    };

    if (destDrop === srcDrop) {
      return onDragEnd(result, {
        ...data[srcDrop],
        categoryHash,
      });
    }

    if (destDrop === 'col-right' && srcDrop === 'col-left') {
      const newElementObjArr = generateElementPropsFromSchemas({
        schema,
        uischema,
        definitionData,
        definitionUi,
        categoryHash,
      });
      const newElementObjArrRight = generateElementPropsFromSchemas({
        schema: schemaRight,
        uischema: uischemaRight,
        definitionData: definitionDataRight,
        definitionUi: definitionUiRight,
        categoryHash,
      });

      const tempBlock = newElementObjArr[src];
      newElementObjArr.splice(src, 1);
      newElementObjArrRight.splice(dest, 0, tempBlock);

      updateSchemas(newElementObjArrRight, {
        schema: schemaRight,
        uischema: uischemaRight,
        definitionData: definitionDataRight || {},
        definitionUi: definitionUiRight || {},
        onChange: onChangeRight,
      });
      updateSchemas(newElementObjArr, {
        schema,
        uischema,
        definitionData: definitionData || {},
        definitionUi: definitionUi || {},
        onChange,
      });
    } else if (srcDrop === 'col-right' && destDrop === 'col-left') {
      const newElementObjArr = generateElementPropsFromSchemas({
        schema,
        uischema,
        definitionData,
        definitionUi,
        categoryHash,
      });
      const newElementObjArrRight = generateElementPropsFromSchemas({
        schema: schemaRight,
        uischema: uischemaRight,
        definitionData: definitionDataRight,
        definitionUi: definitionUiRight,
        categoryHash,
      });

      const tempBlock = newElementObjArrRight[src];
      newElementObjArrRight.splice(src, 1);
      newElementObjArr.splice(dest, 0, tempBlock);

      updateSchemas(newElementObjArrRight, {
        schema: schemaRight,
        uischema: uischemaRight,
        definitionData: definitionDataRight || {},
        definitionUi: definitionUiRight || {},
        onChange: onChangeRight,
      });
      updateSchemas(newElementObjArr, {
        schema,
        uischema,
        definitionData: definitionData || {},
        definitionUi: definitionUi || {},
        onChange,
      });
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <DragDropContext
        onDragEnd={(result) => {
          return onDragEndCustom(result, {
            schema: schemaData,
            uischema: uiSchemaData,
            onChange: (newSchema, newUiSchema) =>
              onChange(stringify(newSchema), stringify(newUiSchema)),
            definitionData: schemaData.definitions,
            definitionUi: uiSchemaData.definitions,

            schemaRight: schemaRightData,
            uischemaRight: uiSchemaRightData,
            onChangeRight: (newSchema, newUiSchema) =>
              onChangeRight(stringify(newSchema), stringify(newUiSchema)),
            definitionDataRight: schemaRightData.definitions,
            definitionUiRight: uiSchemaRightData.definitions,

            categoryHash,
          });
        }}>
        <div className='flex gap-2'>
          <ColBuilder
            data={{
              'col-left': {
                schemaData,
                uiSchemaData,
                cardOpenArray,
                setCardOpenArray,
                onChange: onChange,
              },
              'col-right': {
                schemaData: schemaRightData,
                uiSchemaData: uiSchemaRightData,
                cardOpenArray: cardOpenArrayRight,
                setCardOpenArray: setCardOpenArrayRight,
                onChange: onChangeRight,
              },
            }}
            allFormInputs={allFormInputs}
            categoryHash={categoryHash}
            fields={DEFAULT_FORM_INPUTS}
            type='posttype'
          />
        </div>
      </DragDropContext>
    </div>
  );
}
