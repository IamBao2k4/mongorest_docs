'use client';

import React, { useState } from 'react';
import Add from '../Add';
import Card from '../Card';
import Section from '../Section';
import {
  addCardObj,
  addSectionObj,
  countElementsFromSchema,
  generateElementComponentsFromSchemas,
} from '@/helpers/utils';
import { DEFAULT_FORM_INPUTS } from '@/components/builders/fields/default';

export default function CardGallery({
  definitionSchema,
  definitionUiSchema,
  onChange,
  mods,
  categoryHash,
}) {
  const elementNum = countElementsFromSchema({
    properties: definitionSchema,
  });
  const [cardOpenArray, setCardOpenArray] = useState([...Array(elementNum)].map(() => false));
  const allFormInputs = Object.assign(
    {},
    DEFAULT_FORM_INPUTS,
    (mods && mods.customFormInputs) || {}
  );
  const componentArr = generateElementComponentsFromSchemas({
    schemaData: { properties: definitionSchema },
    uiSchemaData: definitionUiSchema,
    onChange: (newDefinitions, newDefinitionUis) => {
      const oldUi = newDefinitionUis;
      const newUi = {};

      Object.keys(oldUi).forEach((definedUi) => {
        if (!['definitions', 'ui:order'].includes(definedUi)) newUi[definedUi] = oldUi[definedUi];
      });
      onChange(newDefinitions.properties, newUi);
    },
    path: 'definitions',
    definitionData: definitionSchema,
    definitionUi: definitionUiSchema,
    cardOpenArray,
    setCardOpenArray,
    allFormInputs,
    mods,
    categoryHash,
    Card,
    Section,
  }).map((element) => (
    <div
      key={typeof element.key === 'string' ? element.key : ''}
      className='form_gallery_container'>
      {element}
    </div>
  ));

  return (
    <div className='form_gallery'>
      {componentArr}
      {componentArr.length === 0 && <h5>No components in "definitions"</h5>}
      <div className='form_footer'>
        <Add
          addElem={(choice) => {
            if (choice === 'card') {
              addCardObj({
                schema: { properties: definitionSchema },
                uischema: definitionUiSchema,
                mods: mods,
                onChange: (newDefinitions, newDefinitionUis) => {
                  const oldUi = newDefinitionUis;
                  const newUi = {};

                  Object.keys(oldUi).forEach((definedUiSchemaKey) => {
                    if (!['definitions', 'ui:order'].includes(definedUiSchemaKey))
                      newUi[definedUiSchemaKey] = oldUi[definedUiSchemaKey];
                  });
                  onChange(newDefinitions.properties, newUi);
                },
                definitionData: definitionSchema,
                definitionUi: definitionUiSchema,
                categoryHash,
              });
            } else if (choice === 'section') {
              addSectionObj({
                schema: { properties: definitionSchema },
                uischema: definitionUiSchema,
                onChange: (newDefinitions, newDefinitionUis) => {
                  const oldUi = newDefinitionUis;
                  const newUi = {};

                  Object.keys(oldUi).forEach((definedUiSchemaKey) => {
                    if (!['definitions', 'ui:order'].includes(definedUiSchemaKey))
                      newUi[definedUiSchemaKey] = oldUi[definedUiSchemaKey];
                  });
                  onChange(newDefinitions.properties, newUi);
                },
                definitionData: definitionSchema,
                definitionUi: definitionUiSchema,
                categoryHash,
              });
            }
          }}
          hidden={!!definitionSchema && Object.keys(definitionSchema).length !== 0}
        />
      </div>
    </div>
  );
}
