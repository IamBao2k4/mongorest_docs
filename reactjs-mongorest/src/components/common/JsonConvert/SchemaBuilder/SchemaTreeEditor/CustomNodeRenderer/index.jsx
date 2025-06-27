// CustomNodeRenderer.js
import { classifyFieldsIntoGroups } from '@/helpers/classifyFieldsIntoGroups';
import {
  categoryType,
  collectKeysFromChildren,
  defaultDataProps,
  excludeKeys,
  generateRandomKey,
} from '@/helpers/utils';
import { useContext, useEffect, useState } from 'react';
import { changeNodeAtPath } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import { TreeContext } from '../../context/treeContext';
import NodeActions from './NodeActions';
import SelectGroups from './SelectGroups';
import SelectGroupsArray from './SelectGroupsArray';
import { GripVertical, Minus, Plus } from 'lucide-react';

const CustomNodeRenderer = ({
  node,
  path,
  treeIndex,
  connectDragSource,
  connectDragPreview,
  // expanded,
  // toggleNodeExpansion,
  isDragging,
  canDrop,
  isOver,
  didDrop,
  buttons,
  className,
  style,
  schemaBuilder,
  setSchemaBuider,
  schemaData,
  uiSchemaData,
  definitionData,
  definitionUi,
  categoryHash,
  allFormInputs,
  properties,
  setIsDrawerOpen,
  onChange,
  handleUpdateSchema,
  ...otherProps
}) => {
  const rowInfo = { node, path, treeIndex, ...otherProps };

  const {
    treeData,
    setTreeData,
    fields,
    type,
    setHasConverted,
    selectedNodes,
    setSelectedNodes,
    hasNodeChanged,
    setHasNodeChanged,
    addIdReferenceToArray,
  } = useContext(TreeContext);

  const isRoot = path.length === 1;

  const createNodeFromWidget = (widget) => {
    const newCategory = widget;
    const allFormInputs = excludeKeys(Object.assign({}, fields));
    const newType = categoryType(newCategory, allFormInputs);
    const newItems = JSON.parse(JSON.stringify(defaultDataProps(newCategory, allFormInputs)));
    const createId = generateRandomKey();

    let getItems = newItems;

    let newChildren;
    if (getItems?.items) {
      newChildren = [
        {
          id: createId,
          title: 'Items',
          key: 'items',
          type: getItems.items.type,
          expanded: true,
        },
      ];
    }

    const newNode = {
      ...getItems,
      id: node.id,
      key: node.key,
      title: node.title || 'No title',
      type: getItems?.type ? getItems.type : newType,
      description: node.description,
      children: newChildren || [], //truyen object newItems vao children
      expanded: true,
    };
    return newNode;
  };

  const getNodeKey = ({ treeIndex }) => treeIndex;

  const indentation = path.length > 1 ? 25 * (path.length - 1) : 0;

  const countChildren = (node) => {
    if (!node.children || node.children.length === 0) {
      return 0;
    }
    return (
      node.children.length + node.children.reduce((sum, child) => sum + countChildren(child), 0)
    );
  };

  const countExpandedChildren = (node) => {
    if (!node.children || node.children.length === 0) {
      return 0;
    }
    let expandedChildrenCount = node.expanded ? node.children.length : 0;
    for (const child of node.children) {
      if (child.children && child.expanded) {
        expandedChildrenCount += countExpandedChildren(child);
      }
    }

    return expandedChildrenCount;
  };

  const childrenCount = countExpandedChildren(node);

  const countChildrenOfLastNode = (node) => {
    if (!node.children || node.children.length === 0) {
      return 0;
    }
    const lastChild = node.children[node.children.length - 1];
    return countExpandedChildren(lastChild);
  };

  const lastNodeChildrenCount = countChildrenOfLastNode(node);

  const handleToggleExpanded = (rowInfo) => {
    const { node, path } = rowInfo;
    let newTree = changeNodeAtPath({
      treeData,
      path,
      getNodeKey,
      newNode: {
        ...node,
        expanded: !node.expanded,
      },
    });

    setTreeData(newTree);
  };

  const handleChangeData = (value, field) => {
    if (value.length > 0) {
      let newTree;
      if (field === 'title') {
        newTree = changeNodeAtPath({
          treeData,
          path,
          getNodeKey,
          newNode: {
            ...node,
            title: value,
          },
        });
      } else if (field === 'key') {
        const existingKeys = collectKeysFromChildren(rowInfo.parentNode);
        const isKeyDuplicate = existingKeys.has(value);

        if (value !== node.key) {
          if (isKeyDuplicate || value === 'items') {
            setKey(node.key);
            return;
          } else {
            newTree = changeNodeAtPath({
              treeData,
              path,
              getNodeKey,
              newNode: {
                ...node,
                key: value,
              },
            });
          }
        }
      } else if (field === 'widget') {
        const newNode = createNodeFromWidget(value);
        newTree = changeNodeAtPath({
          treeData,
          path,
          getNodeKey,
          newNode,
        });
      } else if (field === 'description') {
        newTree = changeNodeAtPath({
          treeData,
          path,
          getNodeKey,
          newNode: {
            ...node,
            description: value,
          },
        });
        //message.success("Description updated successfully!");
      }
      if (newTree) {
        setHasNodeChanged(addIdReferenceToArray(node, treeData));
        setTreeData(newTree);
      }
    }
  };

  const groups = classifyFieldsIntoGroups(fields, type);

  const [title, setTitle] = useState(null);
  const [focusTitle, setFocusTitle] = useState(false);
  const [key, setKey] = useState(null);
  const [focusKey, setFocusKey] = useState(false);
  const [description, setDescription] = useState(null);
  const [focusDesc, setFocusDesc] = useState(false);

  useEffect(() => {
    setTitle(node.title);
    setKey(node.key);
    setDescription(node?.description ? node.description : '');
  }, [node]);

  const [isChecked, setIsChecked] = useState(
    selectedNodes.some((selectedNode) => selectedNode === rowInfo)
  );

  const handleCheckboxChange = (nodeId, isChecked) => {
    let cloneArr = [...selectedNodes];
    if (isChecked) {
      cloneArr.push(nodeId);
    } else {
      const filter = cloneArr.filter((id) => id !== nodeId);
      cloneArr = [...filter];
    }
    setSelectedNodes(cloneArr);
  };

  return (
    <div
      className={`flex flex-row justify-between h-full mx-auto ${
        isDragging ? `border-isdragging` : `border-b`
      }`}
      style={{
        ...style,
        padding: '0px',
        margin: '0px',
        backgroundColor: isDragging && 'rgba(44, 62, 80, 0.1)',
        //#fafafa
      }}
      {...otherProps}>
      <div className='drop w-1/12 max-w-[40px] border-l border-r px-3 py-3 text-center text-sm flex items-center justify-center'>
        {!isRoot && rowInfo.parentNode?.type !== 'array' && (
          <>
            {connectDragSource(
              connectDragPreview(
                <div>
                  <GripVertical
                    className='cursor-grab'
                    style={{ fontSize: '18px', color: '#2c3e50' }}
                  />
                </div>
              )
            )}
          </>
        )}
      </div>
      <div className='drop w-1/12 max-w-[40px] border-r  px-3 py-3 text-center text-sm flex items-center justify-center'>
        {!isRoot && rowInfo.parentNode?.type !== 'array' && (
          <div className='checkbox-remove'>
            <input
              value={isChecked}
              type='checkbox'
              className='cursor-pointer checkbox-remove-content'
              onClick={() => {
                setIsChecked(!isChecked);
                handleCheckboxChange(node.id, !isChecked);
              }}
            />
          </div>
        )}
      </div>

      {node.children && node.children.length > 0 ? (
        <span
          className='expanded w-1/12 max-w-[40px] border-r px-3 py-3 text-center text-sm flex items-center justify-center cursor-pointer'
          onClick={() => {
            handleToggleExpanded(rowInfo);
          }}>
          {node.expanded ? <Minus /> : <Plus />}
        </span>
      ) : (
        <span className='expanded w-1/12 max-w-[40px] border-r px-3 py-3 text-left text-sm flex items-center'></span>
      )}
      <div
        className={`w-1/3 relative border-r px-3 py-3 text-left text-sm flex items-center ${
          focusTitle && `focus-input`
        }`}
        style={{
          userSelect: 'none',
        }}>
        {node.children && node.children.length > 0 && node.expanded ? (
          <div
            className='top-1/2 absolute h-full border-l border-gray-300'
            style={{
              left: `${indentation + 15 + 5}px`,
              borderLeftWidth: '2px',
              height: `${62 * (childrenCount - lastNodeChildrenCount)}px`,
              borderStyle: 'dashed',
              zIndex: -1,
            }}></div>
        ) : (
          <></>
        )}
        {path.length > 1 && (
          <div
            className='top-1/2 absolute h-full border-t border-gray-300'
            style={{
              left: `${indentation}px`,
              width: `${15}px`,
              borderTopWidth: '2px',
              borderStyle: 'dashed',
              zIndex: -1,
            }}></div>
        )}
        <div
          className='absolute top-1/2 w-2 h-2 rounded-full'
          style={{
            left: `${indentation + 15 + 0}px`,
            transform: 'translate(2px, -50%)',
            backgroundColor: node.widget || node.type === 'array' ? 'rgb(61, 172, 120)' : '#487eb0',
          }}></div>
        <input
          className='absolute w-full'
          style={{
            width: `calc(100% - ${indentation + 15 + 2 + 10}px)`,
            height: '100%',
            left: `${indentation + 15 + 12}px`,
            outline: 'none',
            fontWeight: '500',
            backgroundColor: 'transparent',
          }}
          type='text'
          value={title}
          onClick={() => {}}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          onFocus={(e) => {
            e.target.select();
            setFocusTitle(true);
          }}
          onBlur={(e) => {
            setFocusTitle(false);
            handleChangeData(e.target.value, 'title');
          }}
        />
      </div>
      <div
        className={`w-1/6 border-r text-left text-sm flex items-center ${
          focusKey && `focus-input`
        }`}>
        <input
          className='w-full px-3 py-3'
          style={{
            outline: 'none',
            backgroundColor: 'transparent',
            height: '100%',
          }}
          type='text'
          value={key}
          readOnly={rowInfo?.parentNode?.type === 'array'}
          onChange={(e) => {
            setKey(e.target.value);
          }}
          onFocus={(e) => {
            if (rowInfo?.parentNode?.type === 'array') {
              setFocusKey(false);
            } else {
              e.target.select();
              setFocusKey(true);
            }
          }}
          onBlur={(e) => {
            if (rowInfo?.parentNode?.type === 'array') {
              return;
            } else {
              setFocusKey(false);
              handleChangeData(e.target?.value, 'key');
            }
          }}
          disabled={rowInfo?.parentNode?.type === 'array' ? true : false}
        />
      </div>

      <div className='w-1/6 border-r px-3 py-3 text-left text-sm flex items-center overflow-hidden'>
        {(node.widget && !rowInfo.parentNode.items) || node?.type === 'array' ? (
          <SelectGroups
            groups={groups}
            node={node}
            handleChangeData={handleChangeData}
            allFormInputs={allFormInputs}
          />
        ) : rowInfo?.parentNode?.type === 'array' ? (
          <SelectGroupsArray
            node={node}
            path={path}
            setSchemaBuider={setSchemaBuider}
            rowInfo={rowInfo}
          />
        ) : (
          <div className='w-full flex items-center'></div>
        )}
      </div>

      <div
        className={`w-1/6 border-r text-left text-sm flex items-center ${
          focusDesc && `focus-input`
        }`}>
        <input
          className='w-full px-3 py-3 bg-transparent outline-none h-full'
          type='text'
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          onFocus={(e) => {
            e.target.select();
            setFocusDesc(true);
          }}
          onBlur={(e) => {
            setFocusDesc(false);
            handleChangeData(e.target.value, 'description');
          }}
        />
      </div>
      <div className='actions w-1/6 expanded border-r px-3 py-3 text-center text-sm flex items-center'>
        <div className={`flex items-center justify-center `}>
          <NodeActions
            node={node}
            rowInfo={rowInfo}
            path={path}
            schemaBuilder={schemaBuilder}
            setSchemaBuider={setSchemaBuider}
            schemaData={schemaData}
            uiSchemaData={uiSchemaData}
            definitionData={definitionData}
            definitionUi={definitionUi}
            categoryHash={categoryHash}
            allFormInputs={allFormInputs}
            properties={properties}
            nodeKey={node.key}
            onChange={onChange}
            setIsDrawerOpen={setIsDrawerOpen}
            handleUpdateSchema={handleUpdateSchema}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomNodeRenderer;
