import * as React from 'react';
import { getNodeAtPath } from 'react-sortable-tree';

export function parse(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (err) {
    return {};
  }
}

export function stringify(obj) {
  if (!obj) return '{}';
  return JSON.stringify(obj);
}

export function defaultDataProps(category, allFormInputs) {
  return allFormInputs[category].defaultDataSchema;
}

export function defaultUiProps(category, allFormInputs) {
  return allFormInputs[category].defaultUiSchema;
}
export function categoryType(category, allFormInputs) {
  return allFormInputs[category].type;
}
export function getCardBody(category, allFormInputs) {
  return (allFormInputs[category] && allFormInputs[category].cardBody) || (() => null);
}
export function categoryToNameMap(category, allFormInputs) {
  const categoryNameMap = {};
  Object.keys(allFormInputs).forEach((inputName) => {
    categoryNameMap[inputName] = allFormInputs[inputName].displayName;
  });
  return categoryNameMap;
}

function updateElementNames(elementArray) {
  const elementNames = elementArray.map((elem) => elem.name);
  return elementArray.map((elem) => {
    const newElem = elem;
    newElem.neighborNames = elementNames;
    return newElem;
  });
}

export function generateCategoryHash(allFormInputs) {
  const categoryHash = {};
  Object.keys(allFormInputs).forEach((categoryName) => {
    const formInput = allFormInputs[categoryName];
    formInput.matchIf.forEach((match) => {
      match.types.forEach((type) => {
        const hash = `type:${type === 'null' ? '' : type};widget:${match.widget || ''};field:${
          match.field || ''
        };format:${match.format || ''};$ref:${match.$ref ? 'true' : 'false'};enum:${
          match.enum ? 'true' : 'false'
        }`;
        if (categoryHash[hash]) {
          throw new Error(`Duplicate hash: ${hash}`);
        }
        categoryHash[hash] = categoryName;
      });
    });
  });
  return categoryHash;
}

export function getCardCategory(cardProps, categoryHash) {
  const currentHash = `type:${cardProps.dataOptions.type || ''};widget:${
    cardProps.uiOptions['ui:widget'] || cardProps?.dataOptions?.widget || ''
  };field:${cardProps.uiOptions['ui:field'] || ''};format:${
    cardProps.dataOptions.format || ''
  };$ref:${cardProps.$ref !== undefined ? 'true' : 'false'};enum:${
    cardProps.dataOptions.enum ? 'true' : 'false'
  }`;
  const category = categoryHash[currentHash];
  if (!category) {
    if (cardProps.$ref) return 'ref';

    console.error(`No match for card': ${currentHash} among set`);
    return 'shortAnswer';
  }
  return category;
}

const supportedPropertyParameters = new Set([
  'title',
  'description',
  'enum',
  'minLength',
  'maxLength',
  'multipleOf',
  'minimum',
  'maximum',
  'format',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'type',
  'default',
  'pattern',
  'required',
  'properties',
  'items',
  'definitions',
  '$ref',
  'minItems',
  'maxItems',
  'enumNames',
  'dependencies',
  '$id',
  '$schema',
  'meta',
  'additionalProperties',
  'displayFormat',
  'choices',
  'allowCustom',
  'layout',
  'toggleAll',
  'returnValue',
  'allowNull',
  'isMultiple',
  'widget',
  'formatDate',
  'customRole',
  'row',
  'step',
  'image_type',
  'library_setting',
  'widget',
  'instructions',
  'appearance',
  'post_type',
  'taxonomy',
  'canCreate',
  'canSave',
  'canLoad',
  'isCustom',
  'location',
  'order_group',
  'user_roles',
  'category',
  'depend_field',
  'hideRequire',
  'featured_image',
  'is_active',
  'group',
  'form',
  'form_id',
  'UISchema',
  'JSONschema',
  'typeSelect',
  'tagGroup',
  'tagRules',
  'code',
  'isCreateInModal',
  'isDisable',
  'dataFields',
  'filter',
  'typeRelation',
  'objectKey',
  'navigateTo',
  'hidden',
  'position',
  'format-data',
]);

const supportedUiParameters = new Set([
  'ui:order',
  'ui:widget',
  'ui:autofocus',
  'ui:autocomplete',
  'ui:options',
  'ui:field',
  'ui:placeholder',
  'ui:column',
  'items',
  'definitions',
]);

function checkObjectForUnsupportedFeatures(
  schema,
  uischema,
  supportedWidgets,
  supportedFields,
  supportedOptions
) {
  const unsupportedFeatures = [];

  if (schema && typeof schema === 'object')
    Object.keys(schema).forEach((property) => {
      if (!supportedPropertyParameters.has(property) && property !== 'properties')
        unsupportedFeatures.push(`Unrecognized Object Property: ${property}`);
    });

  if (uischema && typeof uischema === 'object')
    Object.keys(uischema).forEach((uiProperty) => {
      let propDefined = false;

      if (schema.properties && Object.keys(schema.properties).includes(uiProperty))
        propDefined = true;
      if (schema.dependencies) {
        Object.keys(schema.dependencies).forEach((dependencyKey) => {
          Object.keys(schema.dependencies[dependencyKey]).forEach((parameter) => {
            if (parameter === 'oneOf') {
              schema.dependencies[dependencyKey].oneOf.forEach((grouping) => {
                if (grouping.properties)
                  if (Object.keys(grouping.properties).includes(uiProperty)) propDefined = true;
              });
            } else if (parameter === 'properties') {
              if (Object.keys(schema.dependencies[dependencyKey].properties).includes(uiProperty))
                propDefined = true;
            }
          });
        });
      }

      if (!propDefined && !supportedUiParameters.has(uiProperty))
        unsupportedFeatures.push(`Unrecognized UI schema property: ${uiProperty}`);
    });

  if (schema.properties)
    Object.entries(schema.properties).forEach(([parameter, element]) => {
      if (element && typeof element === 'object' && element.type && element.type !== 'object') {
        if (!['array', 'string', 'integer', 'number', 'boolean'].includes(element.type))
          unsupportedFeatures.push(`Unrecognized type: ${element.type} in ${parameter}`);

        Object.keys(element).forEach((key) => {
          if (!supportedPropertyParameters.has(key))
            unsupportedFeatures.push(`Property Parameter: ${key} in ${parameter}`);
        });
      } else {
        Object.keys(element).forEach((key) => {
          if (!supportedPropertyParameters.has(key))
            unsupportedFeatures.push(`Property Parameter: ${key} in ${parameter}`);
        });
      }

      if (
        uischema &&
        uischema[parameter] &&
        element &&
        (!element.type || element.type !== 'object')
      ) {
        Object.keys(uischema[parameter]).forEach((uiProp) => {
          if (!supportedUiParameters.has(uiProp))
            unsupportedFeatures.push(`UI Property: ${uiProp} for ${parameter}`);

          if (uiProp === 'ui:widget' && !supportedWidgets.has(uischema[parameter][uiProp])) {
            unsupportedFeatures.push(`UI Widget: ${uischema[parameter][uiProp]} for ${parameter}`);
          }

          if (uiProp === 'ui:field' && !supportedFields.has(uischema[parameter][uiProp]))
            unsupportedFeatures.push(`UI Field: ${uischema[parameter][uiProp]} for ${parameter}`);

          if (uiProp === 'ui:options')
            Object.keys(uischema[parameter]['ui:options']).forEach((uiOption) => {
              if (!supportedOptions.has(uiOption))
                unsupportedFeatures.push(`UI Property: ui:options.${uiOption} for ${parameter}`);
            });
        });
      }
    });
  return unsupportedFeatures;
}

export function checkForUnsupportedFeatures(schema, uischema, allFormInputs) {
  const unsupportedFeatures = [];
  const widgets = [];
  const fields = [];
  const options = [];
  Object.keys(allFormInputs).forEach((inputType) => {
    allFormInputs[inputType].matchIf.forEach((match) => {
      if (match.widget && !widgets.includes(match.widget)) widgets.push(match.widget);
      if (match.field && !fields.includes(match.field)) fields.push(match.field);
    });
    if (
      allFormInputs[inputType].possibleOptions &&
      Array.isArray(allFormInputs[inputType].possibleOptions)
    ) {
      options.push(...allFormInputs[inputType].possibleOptions);
    }
  });
  const supportedWidgets = new Set(widgets);
  const supportedFields = new Set(fields);
  const supportedOptions = new Set(options);

  if (schema && typeof schema === 'object' && schema.type === 'object') {
    unsupportedFeatures.push(
      ...checkObjectForUnsupportedFeatures(
        schema,
        uischema,
        supportedWidgets,
        supportedFields,
        supportedOptions
      )
    );
  } else {
    unsupportedFeatures.push('jsonSchema form is not of type object');
  }

  return unsupportedFeatures;
}

function generateDependencyElement(
  name,
  dataProps,
  uiProperties,
  requiredNames,
  definitionData,
  definitionUi,
  categoryHash,
  useDefinitionDetails = true
) {
  let uiProps = {
    ...uiProperties,
  };
  const newElement = {};
  let elementDetails = dataProps && typeof dataProps === 'object' ? dataProps : {};

  if (elementDetails.$ref !== undefined && definitionData) {
    const pathArr = typeof elementDetails.$ref === 'string' ? elementDetails.$ref.split('/') : [];
    if (
      pathArr[0] === '#' &&
      pathArr[1] === 'definitions' &&
      definitionData[pathArr[2]] &&
      useDefinitionDetails === true
    ) {
      elementDetails = {
        ...elementDetails,
        ...definitionData[pathArr[2]],
      };
    }

    const definedUiProps = (definitionUi || {})[pathArr[2]];
    uiProps = {
      ...(definedUiProps || {}),
      ...uiProps,
    };
  }

  newElement.name = name;
  newElement.required = requiredNames.includes(name);
  newElement.$ref = typeof elementDetails.$ref === 'string' ? elementDetails.$ref : undefined;

  if (elementDetails.type && elementDetails.type === 'object') {
    newElement.schema = elementDetails;
    newElement.uischema = uiProps || {};
    newElement.propType = 'section';
  } else {
    newElement.dataOptions = elementDetails;
    newElement.uiOptions = uiProps || {};

    const reservedKeys = Object.keys(newElement.dataOptions);
    Object.keys(newElement.uiOptions).forEach((uiKey) => {
      if (reservedKeys.includes(uiKey)) {
        newElement.uiOptions[`ui:*${uiKey}`] = newElement.uiOptions[uiKey];
      }
    });

    newElement.dataOptions.category = getCardCategory(newElement, categoryHash);
    newElement.propType = 'card';
  }
  return newElement;
}

export function generateElementPropsFromSchemas(parameters) {
  const { schema, uischema, definitionData, definitionUi, categoryHash } = parameters;

  if (!schema.properties) return [];

  const elementDict = {};
  const requiredNames = schema.required ? schema.required : [];

  Object.entries(schema.properties).forEach(([parameter, element]) => {
    const newElement = {};
    let elementDetails = element && typeof element === 'object' ? element : {};

    if (elementDetails.$ref !== undefined && definitionData) {
      if (elementDetails.$ref && !elementDetails.$ref.startsWith('#/definitions'))
        throw new Error(`Invalid definition, not at '#/definitions': ${elementDetails.$ref}`);
      const pathArr = elementDetails.$ref !== undefined ? elementDetails.$ref.split('/') : [];
      if (pathArr[0] === '#' && pathArr[1] === 'definitions' && definitionData[pathArr[2]]) {
        elementDetails = {
          ...definitionData[pathArr[2]],
          ...elementDetails,
        };
      }

      const definedUiProps = (definitionUi || {})[pathArr[2]];
      uischema[parameter] = {
        ...(definedUiProps || {}),
        ...uischema[parameter],
      };
    }
    newElement.name = parameter;
    newElement.required = requiredNames.includes(parameter);
    newElement.$ref = elementDetails.$ref;
    newElement.dataOptions = elementDetails;

    if (elementDetails.type && elementDetails.type === 'object') {
      newElement.schema = elementDetails;
      newElement.uischema = uischema[parameter] || {};
      newElement.propType = 'section';
    } else {
      newElement.uiOptions = uischema[parameter] || {};

      const reservedKeys = Object.keys(newElement.dataOptions);
      Object.keys(newElement.uiOptions).forEach((uiKey) => {
        if (reservedKeys.includes(uiKey)) {
          newElement.uiOptions[`ui:*${uiKey}`] = newElement.uiOptions[uiKey];
        }
      });

      newElement.dataOptions.category = getCardCategory(newElement, categoryHash);
      newElement.propType = 'card';
    }
    elementDict[newElement.name] = newElement;
  });

  if (schema.dependencies) {
    const useDefinitionDetails = false;
    Object.keys(schema.dependencies).forEach((parent) => {
      const group = schema.dependencies[parent];
      if (group.oneOf) {
        let possibilityIndex = 0;
        group.oneOf.forEach((possibility) => {
          if (!elementDict?.[parent]?.dependents) {
            elementDict[parent].dependents = [];
          }
          elementDict[parent].dependents.push({
            children: [],
            value: possibility.properties[parent],
          });
          const requiredValues = possibility.required || [];
          Object.entries(possibility.properties).forEach(([parameter, element]) => {
            if (!Object.keys(elementDict).includes(parameter)) {
              const newElement = generateDependencyElement(
                parameter,
                element,
                uischema[parameter],
                requiredNames,
                definitionData,
                definitionUi,
                categoryHash,
                useDefinitionDetails
              );
              newElement.required = requiredValues.includes(newElement.name);
              elementDict[newElement.name] = newElement;
            }
            if (parameter !== parent) {
              const newElement = elementDict[parameter];
              newElement.dependent = true;
              newElement.parent = parent;
              elementDict[parent].dependents[possibilityIndex].children.push(parameter);
            }
          });
          possibilityIndex += 1;
        });
      } else if (group.properties) {
        const requiredValues = group.required || [];
        Object.entries(group.properties).forEach(([parameter, element]) => {
          const newElement = generateDependencyElement(
            parameter,
            element,
            uischema[parameter],
            requiredNames,
            definitionData,
            definitionUi,
            categoryHash,
            useDefinitionDetails
          );
          newElement.required = requiredValues.includes(newElement.name);
          newElement.dependent = true;
          newElement.parent = parent;
          elementDict[newElement.name] = newElement;
          if (elementDict[parent].dependents) {
            elementDict[parent].dependents[0].children.push(parameter);
          } else {
            elementDict[parent].dependents = [{ children: [parameter] }];
          }
        });
      } else {
        console.error('unsupported dependency type encountered');
      }
    });
  }

  const cardPropList = [];
  if (uischema['ui:order']) {
    const remainder = [];
    Object.keys(elementDict).forEach((name) => {
      if (!uischema['ui:order'].includes(name)) remainder.push(elementDict[name]);
    });

    uischema['ui:order'].forEach((name) => {
      if (name === '*') {
        remainder.forEach((remCard) => {
          cardPropList.push(remCard);
        });
      } else if (elementDict[name]) {
        cardPropList.push(elementDict[name]);
      }
    });
  } else {
    Object.keys(elementDict).forEach((name) => {
      cardPropList.push(elementDict[name]);
    });
  }

  updateElementNames(cardPropList);
  return cardPropList;
}

export function countElementsFromSchema(schemaData) {
  if (!schemaData.properties) return 0;
  const elementDict = {};
  let elementCount = 0;

  Object.entries(schemaData.properties).forEach(([parameter]) => {
    elementDict[parameter] = {};
    elementCount += 1;
  });

  if (schemaData.dependencies) {
    Object.keys(schemaData.dependencies).forEach((parent) => {
      const group = schemaData.dependencies[parent];
      if (group.oneOf) {
        let possibilityIndex = 0;
        group.oneOf.forEach((possibility) => {
          if (!elementDict?.[parent]?.dependents) {
            elementDict[parent].dependents = [];
          }
          elementDict[parent].dependents.push({
            children: [],
            value: possibility.properties[parent],
          });
          Object.entries(possibility.properties).forEach(([parameter]) => {
            if (!Object.keys(elementDict).includes(parameter)) {
              elementDict[parameter] = {};
              elementCount += 1;
            }
            if (parameter !== parent) {
              const newElement = elementDict[parameter];
              newElement.dependent = true;
              newElement.parent = parent;
              elementDict[parent].dependents[possibilityIndex].children.push(parameter);
            }
          });
          possibilityIndex += 1;
        });
      } else if (group.properties) {
        Object.entries(group.properties).forEach(([parameter]) => {
          elementDict[parameter] = {};
          elementCount += 1;
          if (elementDict[parent].dependents) {
            elementDict[parent].dependents[0].children.push(parameter);
          } else {
            elementDict[parent].dependents = [{ children: [parameter] }];
          }
        });
      } else {
        console.error('unsupported dependency type encountered');
      }
    });
  }

  return elementCount;
}

export function listArrayElementsFromSchema(schemaData) {
  if (!schemaData.properties) return 0;
  const elementDict = {};
  let elementCount = [];

  Object.entries(schemaData.properties).forEach(([parameter]) => {
    elementDict[parameter] = {};
    elementCount.push(parameter);
  });

  if (schemaData.dependencies) {
    Object.keys(schemaData.dependencies).forEach((parent) => {
      const group = schemaData.dependencies[parent];
      if (group.oneOf) {
        let possibilityIndex = 0;
        group.oneOf.forEach((possibility) => {
          if (!elementDict?.[parent]?.dependents) {
            elementDict[parent].dependents = [];
          }
          elementDict[parent].dependents.push({
            children: [],
            value: possibility.properties[parent],
          });
          Object.entries(possibility.properties).forEach(([parameter]) => {
            if (!Object.keys(elementDict).includes(parameter)) {
              elementDict[parameter] = {};
              elementCount.push(parameter);
            }
            if (parameter !== parent) {
              const newElement = elementDict[parameter];
              newElement.dependent = true;
              newElement.parent = parent;
              elementDict[parent].dependents[possibilityIndex].children.push(parameter);
            }
          });
          possibilityIndex += 1;
        });
      } else if (group.properties) {
        Object.entries(group.properties).forEach(([parameter]) => {
          elementDict[parameter] = {};
          elementCount.push(parameter);
          if (elementDict[parent].dependents) {
            elementDict[parent].dependents[0].children.push(parameter);
          } else {
            elementDict[parent].dependents = [{ children: [parameter] }];
          }
        });
      } else {
        console.error('unsupported dependency type encountered');
      }
    });
  }

  return elementCount;
}

function generateSchemaElementFromElement(element) {
  if (element.$ref !== undefined) {
    const title =
      element.schema !== undefined && element.schema.title !== undefined
        ? element.schema.title
        : element.dataOptions.title;
    const description =
      element.schema !== undefined && element.schema.description !== undefined
        ? element.schema.description
        : element.dataOptions.description;

    let returnElement = {
      $ref: element.$ref,
      title: title,
      description: description,
    };

    const length = element?.schema?.required?.length;
    if (length !== undefined && length > 0) {
      returnElement = { ...returnElement, required: element.schema.required };
    }
    return returnElement;
  } else if (element.propType === 'card') {
    if (element.dataOptions.category === 'section') {
      return {
        type: 'object',
      };
    } else {
      const prop = {};

      Object.keys(element.dataOptions).forEach((key) => {
        if (
          ![
            'category',
            'hideKey',
            'path',
            'definitionData',
            'definitionUi',
            'allFormInputs',
          ].includes(key) &&
          element.dataOptions[key] !== ''
        )
          prop[key] = element.dataOptions[key];
      });
      return prop;
    }
  } else if (element.propType === 'section') {
    return element.schema;
  } else {
    throw new Error('Element that is neither card, section, nor ref');
  }
}

export function generateSchemaFromElementProps(elementArr) {
  if (!elementArr) return {};
  const newSchema = {};

  const props = {};
  const dependencies = {};
  const elementDict = {};
  const dependentElements = new Set([]);
  for (let index = 0; index < elementArr.length; index += 1) {
    const element = elementArr[index];
    elementDict[element.name] = { ...element };
    if (element.dependents)
      element.dependents.forEach((possibility) => {
        possibility.children.forEach((dependentElement) => {
          dependentElements.add(dependentElement);
        });
      });
  }

  Object.keys(elementDict).forEach((elementName) => {
    const element = elementDict[elementName];
    if (element.dependents && element.dependents[0]) {
      if (element.dependents[0].value) {
        dependencies[elementName] = {
          oneOf: element.dependents.map((possibility) => {
            const childrenComponents = {};
            const requiredValues = [];
            possibility.children.forEach((child) => {
              if (elementDict[child]) {
                childrenComponents[child] = generateSchemaElementFromElement(elementDict[child]);
                if (elementDict[child].required) requiredValues.push(child);
              }
            });
            return {
              properties: {
                [elementName]: possibility.value,
                ...childrenComponents,
              },
              required: requiredValues,
            };
          }),
        };
      } else {
        const childrenComponents = {};
        const requiredValues = [];
        element.dependents[0].children.forEach((child) => {
          childrenComponents[child] = generateSchemaElementFromElement(elementDict[child]);
          if (elementDict[child].required) requiredValues.push(child);
        });
        dependencies[elementName] = {
          properties: childrenComponents,
          required: requiredValues,
        };
      }
    }
    if (!dependentElements.has(elementName))
      props[element.name] = generateSchemaElementFromElement(element);
  });

  newSchema.properties = props;
  newSchema.dependencies = dependencies;
  newSchema.required = elementArr
    .filter(({ required, dependent }) => required && !dependent)
    .map(({ name }) => name);

  return newSchema;
}

export function generateUiSchemaFromElementProps(elementArr, definitionUi) {
  if (!elementArr) return {};

  const uiSchema = {};
  const uiOrder = [];
  const definitions = definitionUi;

  elementArr.forEach((element) => {
    uiOrder.push(element.name);
    if (element.$ref !== undefined) {
      const pathArr = typeof element.$ref === 'string' ? element.$ref.split('/') : [];
      if (definitions && definitions[pathArr[2]]) uiSchema[element.name] = definitions[pathArr[2]];
    }
    if (element.propType === 'card' && element.uiOptions) {
      Object.keys(element.uiOptions).forEach((uiOption) => {
        if (!uiSchema[element.name]) uiSchema[element.name] = {};
        if (uiOption.startsWith('ui:*')) {
          uiSchema[element.name][uiOption.substring(4)] = element.uiOptions[uiOption];
        } else {
          uiSchema[element.name][uiOption] = element.uiOptions[uiOption];
        }
      });
    } else if (element.propType === 'section' && Object.keys(element.uischema).length > 0) {
      uiSchema[element.name] = element.uischema;
    }
  });

  uiSchema['ui:order'] = uiOrder;

  return uiSchema;
}

export function getCardParameterInputComponentForType(category, allFormInputs) {
  return (allFormInputs[category] && allFormInputs[category].modalBody) || (() => null);
}

export function updateSchemas(elementArr, parameters) {
  const { schema, uischema, onChange, definitionUi } = parameters;

  const newSchema = Object.assign({ ...schema }, generateSchemaFromElementProps(elementArr));

  const newUiSchema = generateUiSchemaFromElementProps(elementArr, definitionUi);
  if (uischema.definitions) {
    newUiSchema.definitions = uischema.definitions;
  }

  newSchema.type = 'object';

  onChange(newSchema, newUiSchema);
}

export const DEFAULT_INPUT_NAME = 'newInput';

function getIdFromElementsBlock(elements) {
  const names = elements.map((element) => element.name);
  const defaultNameLength = DEFAULT_INPUT_NAME.length;

  return names.length > 0
    ? Math.max(
        ...names.map((name) => {
          if (name.startsWith(DEFAULT_INPUT_NAME)) {
            const index = name.substring(defaultNameLength, name.length);
            const value = Number.parseInt(index);

            if (!isNaN(value)) {
              return value;
            }
          }

          return 0;
        })
      ) + 1
    : 1;
}

export function addCardObj(parameters) {
  const { schema, uischema, mods, onChange, definitionData, definitionUi, index, categoryHash } =
    parameters;
  const newElementObjArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
  });

  const i = getIdFromElementsBlock(newElementObjArr);
  const dataOptions = getNewElementDefaultDataOptions(i, mods);

  const newElement = {
    name: `${DEFAULT_INPUT_NAME}${i}`,
    required: false,
    dataOptions: dataOptions,
    uiOptions: (mods && mods.newElementDefaultUiSchema) || {},
    propType: 'card',
    schema: {},
    uischema: {},
    neighborNames: [],
  };

  if (index !== undefined && index !== null) {
    newElementObjArr.splice(index + 1, 0, newElement);
  } else {
    newElementObjArr.push(newElement);
  }

  updateSchemas(newElementObjArr, {
    schema,
    uischema,
    definitionData,
    definitionUi,
    onChange,
  });
}

export function addSelectCardObj(parameters, category = '') {
  const { schema, uischema, mods, onChange, definitionData, definitionUi, index, categoryHash } =
    parameters;
  const newElementObjArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
  });

  const i = getIdFromElementsBlock(newElementObjArr);
  const dataOptions = getNewElementDefaultDataOptions(i, mods);

  const noUiOptions = ['array'];

  const getType = (val) => {
    let value = 'string';
    if (val === 'array') {
      value = 'array';
    }
    return value;
  };

  const otherDataOption = (val) => {
    let obj = {};
    switch (val) {
      case 'date':
        obj = {
          displayFormat: 'yyyy/MM/dd',
          formatDate: 'date',
          disabled: false,
          field: 'single',
          mode: 'date',
        };
        break;
      case 'dateTime':
        obj = {
          displayFormat: 'yyyy/MM/dd HH:mm:ss',
          formatDate: 'date-time',
          disabled: false,
          field: 'single',
          mode: 'dateTime',
        };
        break;
      case 'time':
        obj = {
          displayFormat: 'HH:mm:ss',
          formatDate: 'time',
          disabled: false,
          min: '00:00:00',
          max: '23:59:59',
          field: 'single',
          mode: 'time',
        };
        break;
      case 'checkbox':
        obj = {
          choices: [],
          default: [],
          allowCustom: false,
          returnValue: 2,
          layout: 0,
          toggleAll: false,
        };
        break;
      case 'radio':
        obj = {
          choices: [],
        };
        break;
      case 'relation':
        obj = {
          typeRelation: {
            title: 'entity',
            entity: 'entity',
            type: 'n-1',
          },
          widget: 'relation',
        };
        break;
      case 'longAnswer':
        obj = {
          customRole: 'textarea',
        };
        break;
      case 'array':
        obj = {
          items: {
            type: 'object',
          },
        };
        break;
      case 'boolean':
        obj = {
          default: false,
        };
        break;
      default:
        obj = {};
        break;
    }
    return obj;
  };

  const newElement = {
    name: `${DEFAULT_INPUT_NAME}${i}`,
    required: false,
    dataOptions: {
      ...dataOptions,
      category,
      ...(category !== 'array'
        ? {
            widget:
              category === 'longAnswer'
                ? 'textarea'
                : category === 'autoGenKeyFromAnotherField'
                  ? 'UriKeyGen'
                  : category === 'number'
                    ? 'numberInput'
                    : category,
          }
        : {}),
      type: getType(category),
      ...otherDataOption(category),
    },
    uiOptions: noUiOptions.includes(category)
      ? {}
      : {
          ['ui:widget']:
            category === 'longAnswer'
              ? 'textarea'
              : category === 'autoGenKeyFromAnotherField'
                ? 'UriKeyGen'
                : category === 'number'
                  ? 'numberInput'
                  : category,
        } || {},
    propType: 'card',
    schema: {},
    uischema: {},
    neighborNames: [],
  };

  if (index !== undefined && index !== null) {
    newElementObjArr.splice(index + 1, 0, newElement);
  } else {
    newElementObjArr.push(newElement);
  }

  updateSchemas(newElementObjArr, {
    schema,
    uischema,
    definitionData,
    definitionUi,
    onChange,
  });
}

export function addSectionObj(parameters) {
  const { schema, uischema, onChange, definitionData, definitionUi, index, categoryHash } =
    parameters;
  const newElementObjArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
  });

  const i = getIdFromElementsBlock(newElementObjArr);

  const newElement = {
    name: `${DEFAULT_INPUT_NAME}${i}`,
    required: false,
    dataOptions: {
      title: `New Input ${i}`,
      type: 'object',
      default: '',
    },
    uiOptions: {},
    propType: 'section',
    schema: { title: `New Input ${i}`, type: 'object' },
    uischema: {},
    neighborNames: [],
  };

  if (index !== undefined && index !== null) {
    newElementObjArr.splice(index + 1, 0, newElement);
  } else {
    newElementObjArr.push(newElement);
  }
  updateSchemas(newElementObjArr, {
    schema,
    uischema,
    definitionData,
    definitionUi,
    onChange,
  });
}
export function addSelectCardObjPosition(parameters, category = '') {
  const { schema, uischema, mods, onChange, definitionData, definitionUi, index, categoryHash } =
    parameters;
  const newElementObjArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
  });
  const i = getIdFromElementsBlock(newElementObjArr);
  const dataOptions = getNewElementDefaultDataOptions(i, mods);
  const noUiOptions = ['shortAnswer'];

  const getType = (val) => {
    let value = 'string';
    if (val === 'array') {
      value = 'array';
    }
    return value;
  };

  const newElement = {
    name: `${DEFAULT_INPUT_NAME}${i}`,
    required: false,
    dataOptions: {
      ...dataOptions,
      category,
      type: getType(category),
    },
    uiOptions: noUiOptions.includes(category)
      ? {}
      : {
          ['ui:widget']: category === 'longAnswer' ? 'textarea' : category,
        } || {},
    propType: 'card',
    schema: {},
    uischema: {},
    neighborNames: [],
  };
  if (index !== undefined && index !== null) {
    newElementObjArr.splice(index + 1, 0, newElement);
  } else {
    newElementObjArr.push(newElement);
  }

  updateSchemas(newElementObjArr, {
    schema,
    uischema,
    definitionData,
    definitionUi,
    onChange,
  });
}

export function generateElementComponentsFromSchemas(parameters, hoverType = '') {
  const {
    schemaData,
    uiSchemaData,
    onChange,
    definitionData,
    definitionUi,
    hideKey,
    path,
    cardOpenArray,
    setCardOpenArray,
    allFormInputs,
    mods,
    canAdd,
    categoryHash,
    Card,
    Section,
    fields,
    type,
  } = parameters;
  const schema = parse(stringify(schemaData));
  const uischema = parse(stringify(uiSchemaData));

  if (!schema.properties) return [];
  const elementPropArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
  });
  const elementList = elementPropArr.map((elementProp, index) => {
    const expanded =
      (cardOpenArray && index < cardOpenArray.length && cardOpenArray[index]) || false;
    if (elementProp.propType === 'card') {
      const TypeSpecificParameters = getCardParameterInputComponentForType(
        elementProp.dataOptions.category || 'string',
        allFormInputs
      );

      return (
        <Card
          hoverType={hoverType}
          fields={fields}
          type={type}
          componentProps={Object.assign(
            {
              name: elementPropArr[index].name,
              required: elementPropArr[index].required,
              hideKey,
              path: `${path}_${elementPropArr[index].name}`,
              definitionData,
              definitionUi,
              neighborNames: elementPropArr[index].neighborNames,
              dependents: elementPropArr[index].dependents,
              dependent: elementPropArr[index].dependent,
              parent: elementPropArr[index].parent,
              ...(type === 'form' ? { allProperties: schema.properties } : {}),
            },
            elementPropArr[index].uiOptions,
            elementPropArr[index].dataOptions
          )}
          canAdd={canAdd}
          key={`${path}_${elementPropArr[index].name}`}
          TypeSpecificParameters={TypeSpecificParameters}
          onChange={(newCardObj) => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            });

            const newDataProps = {};
            const newUiProps = {};
            Object.keys(newCardObj).forEach((propName) => {
              if (propName.startsWith('ui:')) {
                if (propName.startsWith('ui:*')) {
                  newUiProps[propName.substring(4)] = newCardObj[propName];
                } else {
                  newUiProps[propName] = newCardObj[propName];
                }
              } else if (
                ![
                  'name',
                  'required',
                  'neighborNames',
                  'dependents',
                  'dependent',
                  'parent',
                ].includes(propName)
              ) {
                newDataProps[propName] = newCardObj[propName];
              }
            });

            if (newElementObjArr[index].propType === 'card') {
              const oldElement = newElementObjArr[index];
              newElementObjArr[index] = {
                ...oldElement,
                dataOptions: newDataProps,
                uiOptions: newUiProps,
                required: newCardObj.required,
                dependents: newCardObj.dependents,
                dependent: newCardObj.dependent,
                parent: newCardObj.parent,
                name: newCardObj.name,
                $ref: newCardObj.$ref,
                propType: 'card',
              };
            } else {
              throw new Error('Card editing non card element');
            }
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange,
            });
          }}
          onDelete={() => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            });
            newElementObjArr.splice(index, 1);

            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange,
            });
          }}
          onMoveUp={() => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            });
            if (index === 0) return;

            const tempBlock = newElementObjArr[index - 1];
            newElementObjArr[index - 1] = newElementObjArr[index];
            newElementObjArr[index] = tempBlock;
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange,
            });
          }}
          onMoveDown={() => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            });
            if (index === elementPropArr.length - 1) return;

            const tempBlock = newElementObjArr[index + 1];
            newElementObjArr[index + 1] = newElementObjArr[index];
            newElementObjArr[index] = tempBlock;
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange,
            });
          }}
          cloneCardObj={() => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            });
            let cloneElement = JSON.parse(JSON.stringify(newElementObjArr[index]));
            cloneElement.name = cloneElement.name + `-${index + 1}`;
            if (cloneElement?.schema?.title) {
              cloneElement.schema.title = cloneElement?.schema?.title + `-${index + 1}`;
            }
            newElementObjArr.splice(index + 1, 0, cloneElement);
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange,
            });
          }}
          addElem={(choice) => {
            if (choice === 'card') {
              addCardObj({
                schema,
                uischema,
                mods,
                onChange,
                definitionData: definitionData || {},
                definitionUi: definitionUi || {},
                index,
                categoryHash,
              });
            } else if (choice === 'section') {
              addSectionObj({
                schema,
                uischema,
                onChange,
                definitionData: definitionData || {},
                definitionUi: definitionUi || {},
                index,
                categoryHash,
              });
            }
          }}
          cardOpen={expanded}
          setCardOpen={(newState) => {
            setCardOpenArray([
              ...cardOpenArray.slice(0, index),
              newState,
              ...cardOpenArray.slice(index + 1),
            ]);
          }}
          allFormInputs={allFormInputs}
          mods={mods}
        />
      );
    } else if (elementProp.propType === 'section') {
      return (
        <Section
          canAdd={canAdd}
          fields={fields}
          type={type}
          schema={elementProp.schema}
          uischema={elementProp.uischema}
          onChange={(newSchema, newUiSchema, newRef) => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            });

            const oldSection = newElementObjArr[index];

            newElementObjArr[index] = {
              ...oldSection,
              schema: newSchema,
              uischema: newUiSchema,
              propType: 'section',
            };

            if (newRef) newElementObjArr[index].$ref = newRef;

            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange,
            });
          }}
          onNameChange={(newName) => {
            const oldSection = elementProp;

            if (elementPropArr.map((elem) => elem.name).includes(newName)) return;

            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            });
            newElementObjArr[index] = {
              ...oldSection,
              name: newName,
            };
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange,
            });
          }}
          onRequireToggle={() => {
            const oldSection = elementProp;

            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            });
            newElementObjArr[index] = {
              ...oldSection,
              required: !oldSection.required,
            };
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange,
            });
          }}
          onDependentsChange={(newDependents) => {
            const oldSection = elementProp;

            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            });
            newElementObjArr[index] = {
              ...oldSection,
              dependents: newDependents,
            };
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              onChange,
              definitionData,
              definitionUi,
            });
          }}
          onDelete={() => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            });
            newElementObjArr.splice(index, 1);

            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange,
            });
          }}
          onMoveUp={() => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            });
            if (index === 0) return;

            const tempBlock = newElementObjArr[index - 1];
            newElementObjArr[index - 1] = newElementObjArr[index];
            newElementObjArr[index] = tempBlock;
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange,
            });
          }}
          onMoveDown={() => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            });
            if (index === elementPropArr.length - 1) return;

            const tempBlock = newElementObjArr[index + 1];
            newElementObjArr[index + 1] = newElementObjArr[index];
            newElementObjArr[index] = tempBlock;
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange,
            });
          }}
          cloneSectionObj={() => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            });
            let cloneElement = JSON.parse(JSON.stringify(newElementObjArr[index]));
            cloneElement.name = cloneElement.name + `-${index + 1}`;
            if (cloneElement?.schema?.title) {
              cloneElement.schema.title = cloneElement?.schema?.title + `-${index + 1}`;
            }
            newElementObjArr.splice(index + 1, 0, cloneElement);
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange,
            });
          }}
          name={elementProp.name}
          key={`${path}_${elementPropArr[index].name}`}
          required={elementProp.required}
          path={`${path}_${elementProp.name}`}
          definitionData={definitionData || {}}
          definitionUi={definitionUi || {}}
          hideKey={hideKey}
          reference={elementProp.$ref}
          neighborNames={elementProp.neighborNames}
          dependents={elementProp.dependents}
          dependent={elementProp.dependent}
          parent={elementProp.parent}
          cardOpen={expanded}
          setCardOpen={(newState) => {
            setCardOpenArray([
              ...cardOpenArray.slice(0, index),
              newState,
              ...cardOpenArray.slice(index + 1),
            ]);
          }}
          allFormInputs={allFormInputs}
          categoryHash={categoryHash}
          mods={mods}
        />
      );
    } else {
      return (
        <div>
          <h2> Error parsing element </h2>
        </div>
      );
    }
  });

  return elementList;
}

export function onDragEnd(result, details) {
  if (!result.destination) return;
  const { schema, uischema, onChange, definitionData, definitionUi, categoryHash } = details;
  const src = result.source.index;
  const dest = result.destination.index;
  const newElementObjArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
  });

  //Xoá bỏ item ở vị trí cũ
  const moveItem = newElementObjArr[src];
  newElementObjArr.splice(src, 1);

  //Thêm item vào vị trí mới
  newElementObjArr.splice(dest, 0, moveItem);

  updateSchemas(newElementObjArr, {
    schema,
    uischema,
    definitionData: definitionData || {},
    definitionUi: definitionUi || {},
    onChange,
  });
}

function propagateElementChange(elementArr, definitionData, definitionUi, categoryHash) {
  const updatedElementArr = [];
  elementArr.forEach((element) => {
    if (element.propType === 'section') {
      const childrenElements = generateElementPropsFromSchemas({
        schema: element.schema,
        uischema: element.uischema,
        definitionData,
        definitionUi,
        categoryHash,
      });
      const updatedChildren = propagateElementChange(
        childrenElements,
        definitionData,
        definitionUi,
        categoryHash
      );
      const newUiSchema = Object.assign(
        { ...element.uischema },
        generateSchemaFromElementProps(updatedChildren)
      );
      const newSchema = Object.assign(
        { ...element.schema },
        generateSchemaFromElementProps(updatedChildren)
      );
      const newElement = {
        ...element,
        schema: newSchema,
        uischema: newUiSchema,
      };
      updatedElementArr.push(newElement);
    } else {
      updatedElementArr.push(element);
    }
  });
  return updatedElementArr;
}

export function propagateDefinitionChanges(schema, uischema, onChange, categoryHash) {
  const definitionData = schema.definitions;
  const definitionUi = uischema.definitions;
  const bodyElements = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
  });
  const updatedBodyElements = propagateElementChange(
    bodyElements,
    definitionData,
    definitionUi,
    categoryHash
  );

  updateSchemas(updatedBodyElements, {
    schema,
    uischema,
    definitionData,
    definitionUi,
    onChange,
  });
}

export function subtractArray(array1, array2) {
  if (array2 === undefined || array2 === null) return array1;

  const keys = array2.reduce((acc, curr) => {
    acc[curr] = true;
    return acc;
  }, {});

  return array1.filter((v) => !keys[v]);
}

export function excludeKeys(obj, keys) {
  if (!keys) return { ...obj };

  const keysHash = keys.reduce((acc, curr) => {
    acc[curr] = true;
    return acc;
  }, {});

  return Object.keys(obj).reduce(
    (acc, curr) => (keysHash[curr] ? acc : { ...acc, [curr]: obj[curr] }),
    {}
  );
}

export function getNewElementDefaultDataOptions(i, mods) {
  if (mods && mods.newElementDefaultDataOptions !== undefined) {
    const title = `${mods.newElementDefaultDataOptions.title} ${i}`;
    return { ...mods.newElementDefaultDataOptions, ...{ title: title } };
  } else {
    return {
      title: `New Input ${i}`,
      type: 'string',
      default: '',
    };
  }
}

export function getRandomId(length = 50) {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const chars = letters.split('');
  const numberOfChars = chars.length;

  return Array.from({ length: length })
    .map(() => chars[Math.floor(Math.random() * numberOfChars)])
    .join('');
}

export function generateRandomKey() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '#';
  for (let i = 0; i < 50; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return key;
}

export function containsSpecialCharacter(str) {
  // Biểu thức chính quy cho ký tự đặc biệt
  const regex = /[^a-zA-Z0-9]/;
  // Kiểm tra chuỗi có chứa ký tự đặc biệt không
  return regex.test(str);
}

export function convertToTreeData(
  node,
  parentPath = null,
  parentNode = null,
  key = null,
  existingKeys = new Set(),
  requiredArr = []
) {
  if (!node) {
    return {};
  }

  const generateUniqueKey = createUniqueKeyGenerator();
  let currentKey;
  currentKey =
    key !== null ? (existingKeys.has(key) ? generateUniqueKey(key, existingKeys) : key) : null;
  if (currentKey !== null) {
    existingKeys.add(currentKey);
  }

  const isRequired = (requiredArr, nodeKey) => {
    return requiredArr.includes(nodeKey);
  };

  const createId = generateRandomKey();

  let treeNode = {
    id: createId,
    key: key === 'items' ? 'items' : currentKey,
    title: node.title,
    type: node.type,
    description: node.description,
    children: [],
    widget: node.widget,
    expanded: node.expanded ? node.expanded : true,
    require: isRequired(requiredArr, key),
    ...node,
  };

  if (parentPath !== null) {
    treeNode.parentPath = parentPath;
  }

  if (node.properties) {
    const childExistingKeys = new Set();
    Object.keys(node.properties).forEach((propertyKey, index) => {
      treeNode.children.push(
        convertToTreeData(
          node.properties[propertyKey],
          `${parentPath ? `${parentPath}_${treeNode.key}` : 'root'}`,
          node,
          propertyKey,
          childExistingKeys,
          node?.required
        )
      );
    });
  }

  if (node.items) {
    // Xem `items` như một node và thêm vào children của node hiện tại
    treeNode.children.push(
      convertToTreeData(
        node.items,
        `${parentPath ? `${parentPath}_${treeNode.key}` : 'root'}`,
        node,
        'items',
        existingKeys
      )
    );
  }

  if (treeNode.children.length === 0) {
    delete treeNode.children;
  }

  if (!treeNode.description) {
    delete treeNode.description;
  }

  if (!treeNode.widget) {
    delete treeNode.widget;
  }

  if (!treeNode.widget && treeNode.type !== 'array') {
    delete treeNode.require;
  }

  delete treeNode.properties;

  return treeNode;
}

export const convertToSchema = (node, indexPrefix = '') => {
  if (!node) {
    return null;
  }

  let schemaNode = {
    ...node,
    title: node.title,
    type: node.type,
    description: node.description,
    properties: {},
    dependencies: node.dependencies || {},
    required: [],
    widget: node.widget,
  };

  //node?.items
  if (node?.items) {
    // có items chắc chắn có children
    // Lấy children paste gán vao items
    // và không xử lí children đó bỏ qua việc gán giá trị children vào properties
    // và nếu trong items có children thì vẫn xử lí như bình thường
    let itemsNode = { ...node.children[0] };
    if (itemsNode.children && node.children.length > 0) {
      itemsNode.properties = {};
      itemsNode.children.forEach((child) => {
        itemsNode.properties[child.key] = convertToSchema(child, `${indexPrefix}items_`);
      });
    }
    if (itemsNode.children) {
      delete itemsNode.children;
    }
    delete itemsNode.key;
    delete itemsNode.id;
    delete itemsNode.expanded;
    delete itemsNode.parentPath;
    schemaNode.items = itemsNode;
  } else if (node.children && node.children.length > 0) {
    schemaNode.properties = {};
    node.children.forEach((child, index) => {
      let key = child.key;
      let childSchema = convertToSchema(child, `${indexPrefix}${index}_`);
      schemaNode.properties[key] = childSchema;

      if (child.require === true) {
        schemaNode.required.push(key);
      }
    });
  }

  if (!schemaNode.description) {
    delete schemaNode.description;
  }
  if (schemaNode.properties && Object.keys(schemaNode.properties).length === 0) {
    delete schemaNode.properties;
  }
  if (schemaNode.dependencies) {
    delete schemaNode.dependencies;
  }
  if (schemaNode?.required.length <= 0) {
    delete schemaNode.required;
  }
  if (!schemaNode.widget) {
    delete schemaNode.widget;
  }
  delete schemaNode.children;
  // delete schemaNode.expanded;
  delete schemaNode.key;
  delete schemaNode.path;
  delete schemaNode.parentPath;
  //delete schemaNode.require;
  delete schemaNode.id;
  delete schemaNode.form;
  return schemaNode;
};

export function convertJSONToUI(jsonData) {
  let uiData = {};
  let order = [];

  // Phân tích cấu trúc JSON và tạo cấu trúc tương ứng cho UI
  for (const key in jsonData?.properties) {
    const value = jsonData?.properties[key];
    let uiElement = {};

    // Nếu thuộc tính có widget, thêm nó vào uiElement
    if (value?.widget) {
      uiElement['ui:widget'] = value.widget;
    }

    // Nếu thuộc tính có các thuộc tính con (properties), đệ quy gọi convertJSONToUI
    if (value?.properties) {
      const nestedUi = convertJSONToUI({ properties: value.properties });

      // Nếu nestedUi không rỗng, thêm các thuộc tính con vào uiElement
      if (Object.keys(nestedUi).length > 0) {
        uiElement = { ...uiElement, ...nestedUi };
      }
    }

    // Nếu uiElement không rỗng, thêm nó vào uiData
    if (Object.keys(uiElement).length > 0) {
      uiData[key] = uiElement;
    }

    // Thêm key vào order
    order.push(key);
  }

  // Thêm thuộc tính 'ui:order' vào đối tượng trả về nếu có thuộc tính trong uiData
  if (order.length > 0) {
    uiData['ui:order'] = order;
  }

  return uiData;
}

export function collectKeysFromTree(treeData) {
  const keys = new Set();

  function traverse(node) {
    if (node.key) {
      keys.add(node.key);
    }

    if (node.children) {
      node.children.forEach((child) => {
        traverse(child);
      });
    }
  }

  treeData.forEach((node) => {
    traverse(node);
  });

  return keys;
}

export function collectKeysFromChildren(node) {
  const listKeys = new Set();
  if (node?.children && node?.children.length > 0) {
    // Object.keys(node.children).forEach((property, index) => {
    //   console.log('🚀 ~ Object.keys ~ property:', property);

    //   listKeys.add(property);
    // });
    node.children.forEach((child, index) => {
      let key = child.key;
      listKeys.add(key);
    });
  }

  return listKeys;
}

export function createUniqueKeyGenerator() {
  const keyCounter = {};
  return function generateUniqueKey(baseName, existingKeys) {
    if (!existingKeys.has(baseName)) {
      existingKeys.add(baseName);
      return baseName;
    }

    if (!keyCounter[baseName]) {
      keyCounter[baseName] = 1;
    }

    while (existingKeys.has(`${baseName}-${keyCounter[baseName]}`)) {
      keyCounter[baseName]++;
    }

    const newKey = `${baseName}-${keyCounter[baseName]}`;
    existingKeys.add(newKey);
    keyCounter[baseName]++;
    return newKey;
  };
}

export function findSchemaByKey(obj, keyToFilter) {
  if (obj.hasOwnProperty(keyToFilter)) {
    return obj[keyToFilter];
  }
  for (let key in obj) {
    const value = obj[key];
    if (typeof value === 'object' && value !== null) {
      const result = findSchemaByKey(value, keyToFilter);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

export function updateNewSchema(obj, targetKey, newValue) {
  for (let key in obj) {
    if (key === targetKey) {
      obj[key] = newValue;
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      updateNewSchema(obj[key], targetKey, newValue);
    }
  }
  return obj;
}

export function findNodeByKey(nodeKey, data, parentNode = null) {
  if (!data) return null;

  for (const node of data) {
    if (node.key === nodeKey) {
      return parentNode;
    }
    if (node.children && node.children.length > 0) {
      const result = findNodeByKey(nodeKey, node.children, node);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

export function findNodeByPath(treeData, path) {
  const nodeInfo = getNodeAtPath({
    treeData,
    path,
    getNodeKey: ({ treeIndex }) => treeIndex,
  });

  return nodeInfo ? nodeInfo.node : null;
}

// export const hasIdReferenceInAncestors = (node, path, treeData) => {
//   // Nếu path rỗng hoặc chỉ có một phần tử, nghĩa là node không có cha
//   if (path.length <= 1) {
//     return false;
//   }

//   // Lấy đường dẫn cha của node hiện tại
//   const parentPath = path.slice(0, path.length - 1);
//   const parentNode = getNodeAtPath({
//     treeData,
//     path: parentPath,
//     getNodeKey: ({ treeIndex }) => treeIndex,
//   }).node;

//   // Kiểm tra idReference của node cha
//   if (parentNode.idReference) {
//     return parentNode.id;
//   }

//   // Gọi đệ quy để kiểm tra cha của node cha
//   return hasIdReferenceInAncestors(parentNode, parentPath, treeData);
// };

export const findParentNodeById = (treeData, targetId) => {
  const traverse = (nodes, parent = null) => {
    for (let node of nodes) {
      if (node.id === targetId) {
        return parent;
      }
      if (node.children) {
        const foundParent = traverse(node.children, node);
        if (foundParent) {
          return foundParent;
        }
      }
    }
    return null;
  };

  return traverse(treeData);
};

export const hasIdReferenceInAncestors = (node, treeData) => {
  let currentNode = node;

  while (currentNode) {
    const parentNode = findParentNodeById(treeData, currentNode.id);

    if (!parentNode) {
      break;
    }

    if (parentNode.idReference) {
      return parentNode.id;
    }

    currentNode = parentNode;
  }

  return false;
};

export const handleDataAction = async (api, action, payload, refresh, successMsg, errMsg) => {
  try {
    let res;
    switch (action) {
      case 'create':
        res = await api().createData(payload);
        break;
      case 'update':
        res = await api().updateData(payload);
        break;
      case 'delete':
        res = await api().deleteData(payload);
        break;
      default:
        throw new Error('Invalid action');
    }

    if (res) refresh(true);
  } catch (error) {
    console.error(errMsg, error);
  }
};
