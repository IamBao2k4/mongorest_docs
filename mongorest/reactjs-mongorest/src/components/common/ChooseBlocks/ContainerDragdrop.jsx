'use client';

import { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import DragItem from './DragItem';
import AlertBlock from './AlertBlock';
import { resetObject } from '@/helpers/resetObject';
import { changePositionArray } from '@/helpers/changePositionArray';
import { useBlocks } from './context';

function ContainerDragdrop({ selects, setSelects }) {
  if (!selects || !Array.isArray(selects) || !(selects?.length > 0)) return <></>;
  const { blocks } = useBlocks();
  const [collapsed, setCollapsed] = useState([...Array(selects.length)].map(() => false));

  const schemaBlocks = {};
  selects.map((item) => {
    const slugItem = Object.keys(item)[0];
    if (slugItem in blocks && !schemaBlocks[slugItem]) {
      const _blockItem = JSON.parse(JSON.stringify(blocks[slugItem]));
      _blockItem.json.title = blocks[slugItem].title;
      schemaBlocks[slugItem] = {
        json: JSON.stringify(_blockItem.json),
        ui: JSON.stringify(blocks[slugItem].ui),
      };
    }
  });

  const onDrag = (fromIndex, toIndex) => {
    const oldData = [...selects];
    setSelects(changePositionArray(oldData, fromIndex, toIndex));
  };

  const onClickRemove = (index) => {
    const _selects = [...selects];
    _selects?.splice?.(index, 1);
    setSelects([..._selects]);

    const _collapsed = [...collapsed];
    _collapsed?.splice?.(index, 1);
    setCollapsed([..._collapsed]);
  };

  const onClickClone = (index) => {
    const _selects = [...selects];
    const cloneItem = resetObject(_selects[index]);
    _selects?.splice?.(index + 1, 0, cloneItem);

    setCollapsed(new Array(_selects.length).fill(false));
    setSelects(_selects);
  };

  const onClickItem = (data, index) => {
    const _collapsed = JSON.parse(JSON.stringify(collapsed));
    _collapsed[index] = !_collapsed[index];
    setCollapsed(_collapsed);

    if (data) {
      const copy = JSON.parse(JSON.stringify(selects));
      const slug = Object.keys(copy[index])[0];
      copy[index][slug] = data;
      setSelects([...copy]);
    }
  };

  const onSelectBlock = (block) => {
    block.isSelected = !block?.isSelected;
    setSelects([...selects]);
  };

  return (
    <DragDropContext
      onDragEnd={(result) => {
        onDrag(result?.source?.index, result?.destination?.index);
      }}>
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
            innerRef={providedDroppable.innerRef}
            provided={providedDroppable}>
            {selects.map((item, index) => {
              return (
                <Draggable
                  key={index?.toString()}
                  draggableId={index?.toString()}
                  index={index}>
                  {(providedDraggable) => {
                    const slugItem = Object.keys(item)[0].split('___')[0];
                    return (
                      <DragItem
                        key={index}
                        item={item}
                        schema={schemaBlocks[slugItem]}
                        providedDraggable={providedDraggable}
                        onClickRemove={() => onClickRemove(index)}
                        onClickClone={() => onClickClone(index)}
                        onClickItem={(data) => onClickItem(data, index)}
                        isOpen={collapsed[index]}
                        initData={item[slugItem]}
                        onSelect={() => onSelectBlock(item)}
                        isSelected={item?.isSelected}
                      />
                    );
                  }}
                </Draggable>
              );
            })}
            {providedDroppable.placeholder}
          </div>
        )}
      </Droppable>
      <AlertBlock
        selects={selects}
        setSelects={setSelects}
      />
    </DragDropContext>
  );
}

export default ContainerDragdrop;
