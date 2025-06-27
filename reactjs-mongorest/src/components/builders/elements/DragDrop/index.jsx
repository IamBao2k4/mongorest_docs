'use client';

import { Card, Section } from '..';
import {
  generateElementComponentsFromSchemas,
  onDragEnd,
  countElementsFromSchema,
} from '@/helpers/utils';
import { GripVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

function DragDrop({ properties, schemaData, uiSchemaData, allFormInputs, fields, type }) {
  const [cardOpenArray, setCardOpenArray] = useState([]);
  useEffect(() => {
    const elementNum = countElementsFromSchema(schemaData);
    setCardOpenArray([...Array(elementNum).keys()].map(() => false));
  }, [Object.keys(schemaData?.properties)?.length]);

  return (
    <DragDropContext
      onDragEnd={(result) =>
        onDragEnd(result, {
          ...properties,
        })
      }>
      <Droppable
        direction='vertical'
        droppableId='droppable'
        isDropDisabled={false}
        isCombineEnabled={false}
        ignoreContainerClipping={false}>
        {(providedDroppable) => (
          <div
            ref={providedDroppable.innerRef}
            className='flex flex-col gap-4'
            {...providedDroppable.droppableProps}>
            {generateElementComponentsFromSchemas({
              ...properties,
              schemaData,
              uiSchemaData,
              path: 'root',
              cardOpenArray,
              setCardOpenArray,
              allFormInputs,
              mods: {},
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
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default DragDrop;
