'use client';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import CardImage from './CardImage';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  margin: `0 ${grid}px 0 0`,

  ...draggableStyle,
});
export default function CardEditImage({ isDisable, state, setState, setIdMedia, onChange }) {
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(state, result.source.index, result.destination.index);

    setState(items);
    onChange(items);
  };
  const updateNow = (type, value, index) => {
    let data = [...state];
    data[index][type] = value;
    setState(data);
    onChange(data);
  };

  const deleteImage = (index) => {
    const newFiles = [...state];
    if (index === 0) newFiles.shift();
    else {
      newFiles.splice(index, 1);
    }
    setState(newFiles);
    onChange(newFiles);
  };

  if (state && Array.isArray(state) && state.length > 0)
    return (
      <div className='h-full grid overflow-x-auto mt-[10px]'>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            isDropDisabled={false}
            isCombineEnabled={false}
            ignoreContainerClipping={false}
            droppableId='droppable'
            direction='horizontal'>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                className='flex gap-4 overflow-x-auto pb-2'
                {...provided.droppableProps}>
                {state?.map((item, index) => {
                  return (
                    <Draggable
                      key={item?._id?.toString()}
                      draggableId={index.toString()}
                      index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}>
                          <CardImage
                            item={item}
                            index={index}
                            isDisable={isDisable}
                            setIdMedia={setIdMedia}
                            deleteImage={deleteImage}
                            updateNow={updateNow}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );

  return null;
}
