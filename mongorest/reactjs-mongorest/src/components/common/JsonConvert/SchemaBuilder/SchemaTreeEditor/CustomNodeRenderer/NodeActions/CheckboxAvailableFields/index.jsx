import { convertToTreeData, getRandomId } from '@/helpers/utils';
import { useContext, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { TreeContext } from '../../../../context/treeContext';
import { GripVertical, Plus, X } from 'lucide-react';

const CheckboxAvailableFields = ({
  checkedGroupFields,
  setCheckedGroupFields,
  isGroupFieldsDropdown,
}) => {
  const [data, setData] = useState([]);
  const { groupFields } = useContext(TreeContext);

  const handleAddPreviewDraft = (value, idreference) => {
    // console.log('🚀 ~ handleAddPreviewDraft ~ idreference:', idreference);
    const createId = getRandomId();
    const newObject = {
      ...value,
      id: createId,
      idReference: idreference,
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

  const deleteTag = (idToRemove) => {
    const newData = data.filter((item) => item.id !== idToRemove);
    setData(newData);
  };

  // const convertAndAddProperties = (data) => {
  //   let checkedData = [];
  //   if (data.length > 0) {
  //     data.forEach((schema, idx) => {
  //       const node = convertToTreeData(schema);
  //       if (node?.children && node?.children.length > 0) {
  //         node.children.forEach((nodeChild, index) => {
  //           checkedData.push(nodeChild);
  //         });
  //       }
  //     });
  //   }
  //   return checkedData;
  // };

  // useEffect(() => {
  //   const processedData = convertAndAddProperties(data);
  //   setCheckedGroupFields(processedData);
  // }, [data]);

  const renderTreeData = (nodes, indentation = 0, isChild = false) => {
    return nodes.map((node, index) => (
      <div
        key={node.key}
        className='tree-node'>
        <div
          className='btn-item w-fit text-xs px-3 py-2 cursor-pointer mr-1 mb-2'
          style={{
            marginLeft: `${indentation * 30}px`,
            backgroundColor:
              node.widget || node.type === 'array'
                ? 'rgba(61, 172, 120, 0.2)'
                : 'rgba(72,126,176, 0.2)',

            color: node.widget || node.type === 'array' ? 'rgb(61, 172, 120)' : 'rgb(72,126,176)',
            fontWeight: '600',
            borderRadius: '4px',
            position: 'relative',
          }}>
          {`${node.title} ${isChild ? `(type : ${node.type})` : ''}`}
        </div>

        {node.children && node.children.length > 0 && (
          <div className='child-node'>{renderTreeData(node.children, indentation + 1, true)}</div>
        )}
      </div>
    ));
  };

  const [showTreeNode, setShowTreeNode] = useState([]);

  useEffect(() => {
    setCheckedGroupFields(data);
  }, [data]);

  return (
    <>
      {showTreeNode.length > 0 && (
        <div
          className='tree-draft absolute'
          style={{
            right: '50%',
            top: '110%',
            transform: 'translate(-400px, 0%)',
            width: 'fit-content',
            padding: '15px 10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
            borderRadius: '4px',
            zIndex: '4',
          }}>
          <>{renderTreeData(showTreeNode)}</>
        </div>
      )}
      <div
        className='absolute flex items-start justify-between px-4 py-4 check-box-container bg-white rounded-xs  shadow-md h-[350px]'
        style={{
          right: '50%',
          top: '110%',
          transform: 'translate(5px, 0%)',
          zIndex: '3',
          backgroundColor: '#fff',
          borderRadius: '5px',
          width: '400px',
          overflow: 'visible',
        }}>
        <div className='select-group-box w-[200px] h-full overflow-y-scroll no-scrollbar'>
          <p
            className='label mb-2 text-left'
            style={{ fontSize: '14px', fontWeight: '600' }}>
            Fields
          </p>
          {groupFields.map((item, idx) => {
            const nodes = [convertToTreeData(item.jsonschema)];
            return (
              <div className='hover-container container-input-box relative'>
                <div
                  key={item.id}
                  className='input-box flex items-center mb-1'
                  onMouseEnter={() => {
                    setShowTreeNode(nodes);
                  }}
                  onMouseLeave={() => {
                    setShowTreeNode([]);
                  }}>
                  <div
                    style={{
                      backgroundColor: 'rgba(238,82,83, 0.2)',
                      width: '17px',
                      height: '17px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                    }}
                    className='flex items-center justify-center'
                    onClick={() => {
                      handleAddPreviewDraft(item.jsonschema, item.id);
                    }}>
                    <Plus
                      style={{
                        color: 'rgb(238,82,83)',
                        fontSize: '12px',
                        fontWeight: '800',
                      }}
                    />
                  </div>
                  <p
                    className='text-gray-600 ml-1 cursor-pointer'
                    onClick={() => {
                      handleAddPreviewDraft(item.jsonschema, item.id);
                    }}>
                    {item.jsonschema.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className='fixed z-2 right-0 preview-draft w-[200px] h-[315px] overflow-y-scroll no-scrollbar'>
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
                      key={item.id}
                      draggableId={item.id}
                      index={idx}>
                      {(providedDraggable, snapshot) => (
                        <div
                          key={item.id}
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
                              color: 'rgb(238,82,83)',
                            }}
                          />
                          <div
                            className='btn-item flex item-center justify-between w-fit text-xs p-2 cursor-pointer mb-1'
                            style={{
                              backgroundColor: 'rgba(238,82,83, 0.2)',
                              color: 'rgb(238,82,83)',
                              fontWeight: '600',
                              borderRadius: '5px',
                            }}>
                            <p>{item.title}</p>
                            <div
                              className='btn-remove ml-1'
                              onClick={() => deleteTag(item.id)}>
                              <X
                                style={{
                                  color: 'rgb(238,82,83)',
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
        <style jsx>
          {`
            .draggable-item.dragging {
              opacity: 0.5;
            }
            .border-container {
              border: 2px dashed rgb(61, 172, 120);
              border-radius: 5px;
            }
            input[type='checkbox']:checked {
              background-color: #333;
              border: #333;
            }
            .hover-container {
              position: relative;
            }
            .tree-draft {
              display: none;
            }
            .hover-container:hover .tree-draft {
              display: block;
            }
          `}
        </style>
      </div>
    </>
  );
};

export default CheckboxAvailableFields;
