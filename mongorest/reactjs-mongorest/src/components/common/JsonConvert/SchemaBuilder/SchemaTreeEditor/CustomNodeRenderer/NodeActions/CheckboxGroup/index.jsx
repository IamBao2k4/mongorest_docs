import { getRandomId } from '@/helpers/utils';
import { GripVertical, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

const CheckboxGroup = ({ groups, checkedValues, setCheckedValues, isFielsdDropdown }) => {
  const deleteTag = (keyToRemove) => {
    const newData = data.filter((item) => item.key !== keyToRemove);
    setData(newData);
  };

  const [data, setData] = useState([]);

  const handleAddPreviewDraft = (label, value) => {
    const createKey = getRandomId();
    const newObject = {
      key: createKey,
      label: label,
      value: value,
    };
    if (newObject) {
      setData([...data, newObject]);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const reorderedItems = Array.from(data);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);

    setData(reorderedItems);
  };

  useEffect(() => {
    setCheckedValues(data);
  }, [data]);

  return (
    <div
      className='absolute flex items-start justify-between px-4 py-4 check-box-container bg-white rounded-xs border border-gray-200 shadow-md h-[350px]'
      style={{
        right: '50%',
        top: '110%',
        transform: 'translate(5px, 0%)',
        zIndex: '3',
        backgroundColor: '#fff',
        borderRadius: '5px',
        width: '400px',
      }}>
      <div className='select-group-box w-[200px] h-full overflow-y-scroll no-scrollbar'>
        <p
          className='label mb-2 text-left'
          style={{ fontSize: '14px', fontWeight: '600' }}>
          Fields
        </p>
        {groups.map((item, idx) => {
          return (
            <div
              key={idx}
              className='option-box mb-1'>
              <p
                className='label mb-1 text-left text-gray-800'
                style={{ fontSize: '13px', fontWeight: '600' }}>
                {item.label}
              </p>
              <div className='option-box flex flex-col items-start mb-2'>
                {item.options.map((option, idx) => {
                  return (
                    <div
                      key={idx}
                      className='input-box flex items-center mb-1'>
                      <div
                        style={{
                          backgroundColor: 'rgba(243,156,18, 0.2)',
                          width: '17px',
                          height: '17px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                        }}
                        className='flex items-center justify-center'
                        onClick={() => {
                          handleAddPreviewDraft(option.label, option.value);
                        }}>
                        <Plus
                          style={{
                            color: 'rgb(243,156,18)',
                            fontSize: '12px',
                            fontWeight: '800',
                          }}
                        />
                      </div>
                      <p
                        className='text-gray-600 ml-1 cursor-pointer'
                        onClick={() => {
                          handleAddPreviewDraft(option.label, option.value);
                        }}>
                        {option.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className='fixed right-0 preview-draft w-[200px] h-[315px] overflow-y-scroll no-scrollbar'>
        <p
          className='label mb-2 text-left'
          style={{ fontSize: '14px', fontWeight: '600' }}>
          Preview Draft
        </p>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId='droppable'
            isDropDisabled={false}
            isCombineEnabled={false}
            ignoreContainerClipping={false}>
            {(providedDroppable) => (
              <div
                {...providedDroppable.droppableProps}
                ref={providedDroppable.innerRef}>
                {data.map((item, idx) => (
                  <Draggable
                    key={item.key}
                    draggableId={item.key}
                    index={idx}>
                    {(providedDraggable, snapshot) => (
                      <div
                        key={item.key}
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        className={`draggable-item ${snapshot.isDragging ? 'dragging' : ''}`}
                        style={{
                          ...providedDraggable.draggableProps.style,
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                        <GripVertical
                          className='cursor-grab mb-1 mr-1 h-fit'
                          style={{
                            fontSize: '16px',
                            color: 'rgb(243,156,18)',
                          }}
                        />
                        <div
                          className='btn-item flex item-center justify-between w-fit text-xs p-2 cursor-pointer mb-1'
                          style={{
                            backgroundColor: 'rgba(243,156,18, 0.2)',
                            color: 'rgb(243,156,18)',
                            fontWeight: '600',
                            borderRadius: '5px',
                          }}>
                          <p>{item.label}</p>
                          <div
                            className='btn-remove ml-1'
                            onClick={() => deleteTag(item.key)}>
                            <X
                              style={{
                                color: 'rgb(243,156,18)',
                                fontSize: '10px',
                                fontWeight: '500',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {providedDroppable.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <style>
        {`
          .draggable-item.dragging {
            opacity: 0.5;
          }
          .border-container{
            border: 2px dashed rgb(61, 172, 120);
            border-radius: 5px;
          }
          input[type=checkbox]:checked {
            background-color: #333;
            border: #333;
          }
        `}
      </style>
    </div>
  );
};

export default CheckboxGroup;
