import checkboxSetting from '../../Checkbox/settings';
import dateTimeSetting from '../../DateAndTime/settings';
import fileSetting from '../../File/settings';
import multiFileSetting from '../../MultiFile/settings';
import longAnswerSetting from '../../LongAnswer/settings';
import numberSetting from '../../Number/settings';
import radioSetting from '../../Radio/settings';
import relationSetting from '../../Relation/settings';
import selectSetting from '../../Select/settings';
import shortAnswerSetting from '../../ShortAnswer/settings';
import conditionSetting from '../../Condition/settings';
import hrefSetting from '../../Href/settings';
import booleanSetting from '../../Boolean/settings';
import iconSetting from '../../Icon/settings';
import dataSetting from '../../Data/settings';
import multiImage from '../../MultiImage/settings';
import rangeSetting from '../../Range/settings';
import ArraySetting from './ArraySetting';
import functionSetting from '../../Function/settings';

import React, { useState } from 'react';
import {
  excludeKeys,
  generateCategoryHash,
  generateElementComponentsFromSchemas,
  getRandomId,
} from '@/helpers/utils';
import { Card, Section } from '@/components/builders/elements';

function getInnerCardComponent({ defaultFormInputs }) {
  return function InnerCard({ parameters, onChange, mods }) {
    const [elementId] = useState(getRandomId());
    const newDataProps = {};
    const newUiProps = {};
    const allFormInputs = excludeKeys(
      Object.assign({}, defaultFormInputs, (mods && mods.customFormInputs) || {}),
      mods && mods.deactivatedFormInputs
    );

    Object.keys(parameters).forEach((propName) => {
      if (propName.startsWith('ui:*')) {
        newUiProps[propName.substring(4)] = parameters[propName];
      } else if (propName.startsWith('ui:')) {
        newUiProps[propName] = parameters[propName];
      } else if (!['name', 'required'].includes(propName)) {
        newDataProps[propName] = parameters[propName];
      }
    });

    const definitionData = parameters.definitionData ? parameters.definitionData : {};
    const definitionUi = parameters.definitionUi ? parameters.definitionUi : {};

    const [cardOpen, setCardOpen] = React.useState(false);

    if (parameters.type !== 'array') {
      return <h4>Not an array </h4>;
    }
    return (
      <div className='card-array'>
        <div className='card'>
          {generateElementComponentsFromSchemas({
            schemaData: { properties: { item: newDataProps.items } },
            uiSchemaData: { item: newUiProps.items },
            onChange: (schema, uischema) => {
              onChange({
                ...parameters,
                items: schema.properties.item,
                'ui:*items': uischema.item || {},
              });
            },
            path: elementId,
            definitionData,
            definitionUi,
            hideKey: true,
            cardOpenArray: [cardOpen],
            setCardOpenArray: (newArr) => setCardOpen(newArr[0]),
            allFormInputs,
            mods,
            categoryHash: generateCategoryHash(allFormInputs),
            fields: defaultFormInputs,
            type: 'posttype',
            Card: (props) => (
              <Card
                {...props}
                showObjectNameInput={false}
                isArray={true}
              />
            ),
            Section: Section,
          })}
        </div>
      </div>
    );
  };
}

const defaultFormInputs = {
  ...shortAnswerSetting,
  ...longAnswerSetting,
  ...numberSetting,
  ...dateTimeSetting,
  ...radioSetting,
  ...selectSetting,
  ...checkboxSetting,
  ...fileSetting,
  ...multiFileSetting,
  ...relationSetting,
  ...conditionSetting,
  ...hrefSetting,
  ...booleanSetting,
  ...iconSetting,
  ...dataSetting,
  ...multiImage,
  ...rangeSetting,
  ...functionSetting,
};

defaultFormInputs.array = {
  displayName: 'Array',
  matchIf: [
    {
      types: ['array'],
    },
    { types: ['array'], widget: ['array'] },
  ],
  defaultDataSchema: {
    items: { type: 'object' },
  },
  defaultUiSchema: {},
  type: 'array',
  cardBody: getInnerCardComponent({ defaultFormInputs }),
  modalBody: ArraySetting,
};

const setting = {
  array: {
    displayName: 'Array',
    matchIf: [
      {
        types: ['array'],
      },
      { types: ['array'], widget: ['array'] },
    ],
    defaultDataSchema: {
      items: { type: 'object' },
    },

    defaultUiSchema: {},
    type: 'array',
    cardBody: getInnerCardComponent({ defaultFormInputs }),
    modalBody: ArraySetting,
  },
};

export default setting;
