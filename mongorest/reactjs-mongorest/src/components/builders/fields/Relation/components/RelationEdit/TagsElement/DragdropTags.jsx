import { Link } from '@/components/ui/Link';
import { Tag } from '@/components/ui/Tag';
import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

function DragdropTags({ selected, isDisable, onChangeProps, onChange, type }) {
  const [show, setShow] = useState(false);
  const onDragEnd = function (result) {
    const { source, destination } = result;
    if (!destination || !source || destination?.index === source?.index) {
      return;
    }
    let copy = JSON.parse(JSON.stringify(selected));
    const itemToRearrange = { ...copy[source.index] };
    copy.splice(source.index, 1);
    copy.splice(destination.index, 0, itemToRearrange);

    onChange(copy);
  };
  if (!selected) return <></>;

  return (
    selected &&
    selected?.length > 0 && (
      <div className='my-2'>
        {
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              direction='horizontal'
              droppableId='droppable'
              isDropDisabled={false}
              isCombineEnabled={false}
              ignoreContainerClipping={false}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}>
                  <div className='flex gap-1 flex-wrap'>
                    {selected?.slice(0, !show ? 10 : selected?.length).map((item, index) => (
                      <Draggable
                        key={item?._id?.toString()}
                        draggableId={item?._id?.toString()}
                        index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            key={item?._id}>
                            <Tag
                              className='inline-flex items-center'
                              closable
                              disabled={isDisable}
                              onClose={(e) => {
                                e.preventDefault();
                                onChangeProps(selected.filter((tag) => tag._id !== item._id));
                              }}>
                              <div {...provided.dragHandleProps}>
                                <DragHandleDots2Icon className='-ml-1 opacity-20 mr-1' />
                              </div>
                              <Link href={`/${item?.title}`}>
                                <p>
                                  {typeof item === 'string'
                                    ? item
                                    : item?.title ||
                                      item?.name ||
                                      item?.username ||
                                      item?.email ||
                                      item?.content}
                                </p>
                              </Link>
                            </Tag>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        }
        {selected?.length > 10 && (
          <span
            className='mt-2 cursor-pointer'
            style={{ color: '#1677ff' }}
            onClick={() => setShow(!show)}>
            {!show ? 'Show more' : 'Show less'}
          </span>
        )}
      </div>
    )
  );
}

export default DragdropTags;
