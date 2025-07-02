'use client';

import { Card, Section } from '@/components/builders/elements';
import { Card as CardShadcn } from '@/components/ui/Card';
import { generateElementComponentsFromSchemas, stringify } from '@/helpers/utils';
import { GripVertical } from 'lucide-react';
import { Draggable, Droppable } from 'react-beautiful-dnd';

function ColBuilder({ data, allFormInputs, categoryHash, fields, type }) {
  return ['col-left', 'col-right'].map((item) => {
    const { schemaData, uiSchemaData, cardOpenArray, setCardOpenArray, onChange } = data[item];
    return (
      <div
        className='flex-1'
        key={item}>
        <CardShadcn>
          <div className='mb-8'>
            <Droppable
              direction='vertical'
              isDropDisabled={false}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
              droppableId={item}
              key={item}>
              {(providedDroppable) => {
                return (
                  <div
                    ref={providedDroppable.innerRef}
                    className='flex flex-col gap-4 h-full p-1'
                    {...providedDroppable.droppableProps}>
                    {generateElementComponentsFromSchemas({
                      schemaData,
                      uiSchemaData,
                      onChange: (newSchema, newUiSchema) =>
                        onChange(stringify(newSchema), stringify(newUiSchema)),
                      definitionData: schemaData.definitions,
                      definitionUi: uiSchemaData.definitions,
                      path: 'root',
                      cardOpenArray,
                      setCardOpenArray,
                      allFormInputs,
                      mods: {},
                      categoryHash,
                      Card,
                      Section,
                      fields,
                      type,
                    }).map((element, index) => {
                      return (
                        <Draggable
                          key={element.key}
                          draggableId={element.key}
                          index={index}>
                          {(providedDraggable) => (
                            <div
                              className='card relative'
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}>
                              <div
                                className='absolute left-3 top-4 z-10'
                                {...providedDraggable.dragHandleProps}>
                                <div className='p-4'>
                                  <GripVertical />
                                </div>
                              </div>
                              {element}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {providedDroppable.placeholder}
                  </div>
                );
              }}
            </Droppable>
          </div>
        </CardShadcn>
      </div>
    );
  });
}

export default ColBuilder;
