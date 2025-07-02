import { classifyFieldsIntoGroups } from '@/helpers/classifyFieldsIntoGroups';
import {
  categoryType,
  collectKeysFromChildren,
  collectKeysFromTree,
  convertToTreeData,
  createUniqueKeyGenerator,
  defaultDataProps,
  excludeKeys,
  findNodeByPath,
  generateRandomKey,
} from '@/helpers/utils';
import {
  BlockOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useContext, useEffect, useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import {
  addNodeUnderParent,
  changeNodeAtPath,
  getNodeAtPath,
  removeNodeAtPath,
} from 'react-sortable-tree';
import { TreeContext } from '../../../context/treeContext';
import AdditionalSettings from './AdditionalSettings';
import CheckboxAvailableFields from './CheckboxAvailableFields';
import CheckboxGroup from './CheckboxGroup';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet';

const NodeActions = ({
  node,
  rowInfo,
  path,
  schemaBuilder,
  setSchemaBuider,
  schemaData,
  uiSchemaData,
  definitionData,
  definitionUi,
  categoryHash,
  allFormInputs,
  properties,
  nodeKey,
  onChange,
  handleUpdateSchema,
}) => {
  const {
    treeData,
    setTreeData,
    fields,
    type,
    setHasConverted,
    addIdReferenceToArray,
    hasNodeChanged,
    setHasNodeChanged,
  } = useContext(TreeContext);

  const isRoot = path.length === 1;

  const getNodeKey = ({ treeIndex }) => treeIndex;

  function getMaxIndexFromChildren(node) {
    if (!node?.children || node?.children.length === 0) {
      return 0;
    }

    let maxIndex = 0;
    const regex = /New Input (\d+)/;

    for (const child of node.children) {
      const match = child.title.match(regex);
      if (match) {
        const index = parseInt(match[1], 10);
        if (index > maxIndex) {
          maxIndex = index;
        }
      }
    }

    return maxIndex;
  }

  function createNewKey(treeData, currentNode) {
    const maxIndex = getMaxIndexFromChildren(currentNode);
    let baseName;
    if (isRoot) {
      baseName = `newInput${maxIndex + 1}`;
    } else {
      if (node?.key?.startsWith('newInput')) {
        let getNodeId;

        if (node.key) {
          getNodeId = node.key[8];
        } else {
          getNodeId = maxIndex + 1;
        }
        baseName = `newInput${getNodeId}`;
      } else {
        baseName = generateRandomKey();
      }
    }

    const existingKeys = collectKeysFromTree(treeData);
    const generateUniqueKey = createUniqueKeyGenerator();
    const newNodeKey = generateUniqueKey(baseName, existingKeys);

    return newNodeKey;
  }

  function createNewKeyyyyy(treeData, currentNode) {
    const maxIndex = getMaxIndexFromChildren(currentNode);
    let baseName;
    if (isRoot) {
      baseName = `newInput${maxIndex + 1}`;
    } else {
      if (node?.key?.startsWith('newInput')) {
        baseName = `newInput${maxIndex + 1}`;
      } else if (node?.key?.startsWith('items')) {
        baseName = `items${maxIndex + 1}`;
      } else {
        baseName = `newInput${maxIndex + 1}`;
        // baseName = generateRandomKey();
      }
    }

    const existingKeys = collectKeysFromChildren(currentNode);
    const generateUniqueKey = createUniqueKeyGenerator();
    const newNodeKey = generateUniqueKey(baseName, existingKeys);

    return newNodeKey;
  }

  function createNode(rowInfo, type) {
    const { path } = rowInfo;
    let currentParentNode = path[path.length - 1];
    const maxIndex = getMaxIndexFromChildren(rowInfo.node);

    const newNodeKey = createNewKeyyyyy(treeData, rowInfo.node);
    const createId = generateRandomKey();
    let newTree;
    if (type === 'section') {
      newTree = addNodeUnderParent({
        treeData,
        parentKey: currentParentNode,
        expandParent: true,
        getNodeKey,
        newNode: {
          id: createId,
          key: newNodeKey,
          title: `New Input ${maxIndex + 1}`,
          type: 'object',
        },
      });
    } else if (type === 'element') {
      newTree = addNodeUnderParent({
        treeData,
        parentKey: currentParentNode,
        expandParent: true,
        getNodeKey,
        newNode: {
          id: createId,
          key: newNodeKey,
          title: `New Input ${maxIndex + 1}`,
          type: 'string',
          widget: 'shortAnswer',
        },
      });
    }
    if (newTree) {
      currentParentNode = null;
      setHasNodeChanged(addIdReferenceToArray(node, treeData));
      setTreeData(newTree.treeData);
      handleUpdateSchema(newTree.treeData);
    }
  }

  function updateParentRequiredArray(treeData, path) {
    if (path.length === 0) return treeData; // Không có node cha nếu path trống

    // Lấy path của node cha
    const parentPath = path.slice(0, -1);

    const parent = getNodeAtPath({
      treeData,
      path: parentPath,
      getNodeKey,
    });

    if (parent?.node && parent?.node?.required) {
      // Xóa key khỏi mảng 'required' của node cha
      parent.node.required = parent.node.required.filter((key) => key !== nodeKey);
    }

    // Cập nhật tree data với node cha đã được sửa đổi
    return changeNodeAtPath({
      treeData,
      path: parentPath,
      newNode: { ...parent.node },
      getNodeKey,
    });
  }

  function removeNode(rowInfo) {
    const { path } = rowInfo;

    //cập nhật required parent node
    ///let updatedTreeData = updateParentRequiredArray(treeData, path);

    // Xóa node trong treeData
    const updatedTreeData = removeNodeAtPath({
      treeData,
      path,
      getNodeKey,
    });
    setHasNodeChanged(addIdReferenceToArray(node, treeData));
    setTreeData(updatedTreeData);
  }

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const onCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const [isFielsdDropdown, setIsFielsdDropdown] = useState(false);

  const groups = classifyFieldsIntoGroups(fields, type);
  const [checkedValues, setCheckedValues] = useState([]);

  const createNodeFromWidget = (widget, treeData, currentNode) => {
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

    const maxIndex = getMaxIndexFromChildren(currentNode); ///coi lai do tao nhiu nreInput1
    const newNodeKey = createNewKeyyyyy(treeData, currentNode);

    const newNode = {
      ...getItems,
      id: createId,
      key: newNodeKey,
      title: `New Input ${maxIndex + 1}`,
      type: getItems?.type ? getItems.type : newType,
      children: newChildren || [], //truyen object newItems vao children
      expanded: true,
    };
    return newNode;
  };

  useEffect(() => {
    const addMutipleNodes = (fieldsArr) => {
      let currentParentNodePath = path;
      let currentParentNode = path[path.length - 1];
      let newTreeData = treeData;
      fieldsArr.forEach((item, idx) => {
        //const currentNode = findNodeByKey(node.key, newTreeData);
        const currentNode = findNodeByPath(newTreeData, currentParentNodePath);
        const newNode = createNodeFromWidget(item.value, newTreeData, currentNode);
        const newTree = addNodeUnderParent({
          treeData: newTreeData,
          parentKey: currentParentNode,
          expandParent: true,
          getNodeKey,
          newNode,
        });
        if (newTree) {
          newTreeData = newTree.treeData;
        }
      });
      currentParentNode = null;

      setTreeData(newTreeData);
    };
    if (!isFielsdDropdown && checkedValues.length > 0) {
      addMutipleNodes(checkedValues);
      setHasNodeChanged(addIdReferenceToArray(node, treeData));
      setCheckedValues([]);
    }
  }, [isFielsdDropdown]);

  function cloneNode(rowInfo) {
    const { path } = rowInfo;
    const currentParentNode = path[path.length - 2];

    const handleNode = (node, isChild) => {
      const existingKeys = collectKeysFromTree(treeData);
      const generateUniqueKey = createUniqueKeyGenerator();
      const createKey = generateUniqueKey(node.key, existingKeys);
      const createId = generateRandomKey();

      let treeNode = {
        ...node,
        id: createId,
        key: isChild ? node.key : createKey,
        title: isChild ? node.title : `${node.title}-1`,
        children: [],
      };

      if (node.children && node.children.length > 0) {
        Object.keys(node.children).forEach((propertyKey, index) => {
          treeNode.children.push(handleNode(node.children[propertyKey], true));
        });
      }
      return treeNode;
    };

    const clonedNode = handleNode(rowInfo.node, false);

    //dựa vào id sắp xếp lại newTree.treeData sao cho nodeclone nằm ngay sau node bị clone và update lại nodePath
    const insertNodeAfterId = (nodeId, newNode, treeData) => {
      const cloneTree = [...treeData];

      const insertNode = (nodeId, newNode, treeData) => {
        for (let i = 0; i < treeData.length; i++) {
          const item = treeData[i];

          if (item.id === nodeId) {
            // Chèn newNode vào sau nodeId
            treeData.splice(i + 1, 0, newNode);
            return true; // Đánh dấu đã chèn thành công
          } else if (item.children && item.children.length > 0) {
            // Nếu có children, đệ quy vào children
            if (insertNode(nodeId, newNode, item.children)) {
              return true; // Nếu chèn thành công trong children, trả về true
            }
          }
        }
        return false; // Trả về false nếu không tìm thấy nodeId
      };

      insertNode(nodeId, newNode, cloneTree);
      return cloneTree;
    };

    const updatedTree = insertNodeAfterId(rowInfo.node.id, clonedNode, treeData);
    setHasNodeChanged(addIdReferenceToArray(node, treeData, 'clone'));
    setTreeData(updatedTree);
  }

  const [isGroupFieldsDropdown, setIsGroupFieldsDropdown] = useState(false);

  const [checkedGroupFields, setCheckedGroupFields] = useState([]);

  // sua cho nay de render cho dung
  useEffect(() => {
    const cloneMutipleNodes = (fieldsArr) => {
      const { path } = rowInfo;
      let currentParentNodePath = path;
      let currentParentNode = path[path.length - 1];
      let newTreeData = treeData;
      fieldsArr.forEach((item, idx) => {
        const nodeConvert = convertToTreeData(item);
        const currentNode = findNodeByPath(newTreeData, currentParentNodePath);
        const existingKeys = collectKeysFromChildren(currentNode);
        const generateUniqueKey = createUniqueKeyGenerator();
        const baseName = nodeConvert.title.toLowerCase().replace(/\s+/g, '');
        const createKey = generateUniqueKey(baseName, existingKeys);
        const newTree = addNodeUnderParent({
          treeData: newTreeData,
          parentKey: currentParentNode,
          expandParent: true,
          getNodeKey,
          newNode: {
            ...nodeConvert,
            key: createKey,
          },
        });
        if (newTree) {
          newTreeData = newTree.treeData;
        }
      });
      currentParentNode = null;

      setTreeData(newTreeData);
    };
    if (!isGroupFieldsDropdown && checkedGroupFields.length > 0) {
      cloneMutipleNodes(checkedGroupFields);
      setHasNodeChanged(addIdReferenceToArray(node, treeData));
      setCheckedGroupFields([]);
    }
  }, [isGroupFieldsDropdown]);

  const [expandedActions, setExpandedActions] = useState(false);

  return (
    <>
      <div className='flex justify-between'>
        {/* rowInfo.parentNode?.items */}
        {!node.widget && node.type !== 'array' ? (
          <>
            <div
              style={{
                background: 'rgb(61, 172, 120)',
              }}
              className='btn-icon flex items-center justify-center'
              onClick={() => {
                createNode(rowInfo, 'element');
              }}>
              <PlusOutlined style={{ color: '#fff' }} />
            </div>
            <div
              style={{
                background: '#487eb0',
              }}
              className='btn-icon flex items-center justify-center'
              onClick={() => {
                createNode(rowInfo, 'section');
              }}>
              <PlusOutlined style={{ color: '#fff' }} />
            </div>
          </>
        ) : (
          <div className='w-[70px]'></div>
        )}
        {!isRoot && rowInfo.parentNode?.type !== 'array' ? (
          <div
            style={{
              background: '#e74c3c',
            }}
            className='btn-icon flex items-center justify-center'
            onClick={() => {
              removeNode(rowInfo);
            }}>
            <DeleteOutlined style={{ color: '#fff' }} />
          </div>
        ) : (
          <div className='w-[35px]'></div>
        )}
        <OutsideClickHandler
          onOutsideClick={() => {
            setExpandedActions(false);
          }}>
          <div className='actions-dropdown relative'>
            <div
              style={{
                background: '#2c3e50',
              }}
              className='btn-icon flex items-center justify-center'
              onClick={() => {
                setExpandedActions(!expandedActions);
              }}>
              <MoreOutlined style={{ fontSize: '18px', color: '#fff' }} />
            </div>

            {expandedActions && (
              <div
                className='box-dropdown absolute py-2 px-1'
                style={{
                  zIndex: '2',
                  right: '50%',
                  top: '100%',
                  transform: 'translate(5px , 0)',
                  width: 'fit-content',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                }}>
                {!node.widget && node.type !== 'array' && (
                  <>
                    <div
                      className='btn-action flex items-center  px-3 py-2'
                      onClick={() => {
                        setIsFielsdDropdown(true);
                      }}>
                      <div
                        style={{
                          background: '#f39c12',
                        }}
                        className='relative btn-icon flex items-center justify-center'>
                        <PlusOutlined style={{ color: '#fff' }} />
                        {isFielsdDropdown && (
                          <OutsideClickHandler
                            onOutsideClick={() => {
                              setIsFielsdDropdown(false);
                            }}>
                            <CheckboxGroup
                              groups={groups}
                              checkedValues={checkedValues}
                              setCheckedValues={setCheckedValues}
                              isFielsdDropdown={isFielsdDropdown}
                            />
                          </OutsideClickHandler>
                        )}
                      </div>
                      <p className='text-sm font-medium'>Multiple Elements</p>
                    </div>
                    <div
                      className='btn-action flex items-center  px-3 py-1'
                      onClick={() => {
                        setIsGroupFieldsDropdown(true);
                      }}>
                      <div
                        style={{
                          background: '#ee5253',
                        }}
                        className='relative btn-icon flex items-center justify-center'>
                        <PlusOutlined style={{ color: '#fff' }} />
                        {isGroupFieldsDropdown && (
                          <OutsideClickHandler
                            onOutsideClick={() => {
                              setIsGroupFieldsDropdown(false);
                            }}>
                            <CheckboxAvailableFields
                              checkedGroupFields={checkedGroupFields}
                              setCheckedGroupFields={setCheckedGroupFields}
                              isGroupFieldsDropdown={isGroupFieldsDropdown}
                            />
                          </OutsideClickHandler>
                        )}
                      </div>
                      <p className='text-sm font-medium'>Clone Group Fields</p>
                    </div>
                  </>
                )}
                {/* node.widget || node.type === 'array' */}
                {!isRoot && (
                  <div
                    className='btn-action flex items-center  px-3 py-2'
                    onClick={() => {
                      setIsDrawerOpen(true);
                    }}>
                    <div
                      style={{
                        background: '#2c3e50',
                      }}
                      className='btn-icon flex items-center justify-center'>
                      <SettingOutlined style={{ color: '#fff' }} />
                    </div>
                    <p className='text-sm font-medium'>Additional Settings</p>
                  </div>
                )}

                {!isRoot && rowInfo.parentNode?.type !== 'array' && (
                  <div
                    className='btn-action flex items-center  px-3 py-2'
                    onClick={() => {
                      cloneNode(rowInfo);
                    }}>
                    <div
                      style={{
                        background: '#7f8c8d',
                      }}
                      className='btn-icon btn-clone flex items-center justify-center'>
                      <BlockOutlined style={{ color: '#fff' }} />
                    </div>
                    <p className='text-sm font-medium'>Clone Node</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </OutsideClickHandler>
      </div>
      <Sheet
        open={isDrawerOpen}
        onOpenChange={() => setIsDrawerOpen(false)}>
        <SheetContent className='sm:max-w-[40%] flex flex-col'>
          <SheetHeader>
            <SheetTitle>Additional Settings</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <AdditionalSettings
            nodeType={node.type}
            rowInfo={rowInfo}
            node={node}
            schemaBuilder={schemaBuilder}
            setSchemaBuider={setSchemaBuider}
            schemaData={schemaData}
            uiSchemaData={uiSchemaData}
            definitionData={definitionData}
            definitionUi={definitionUi}
            categoryHash={categoryHash}
            nodeKey={nodeKey}
            allFormInputs={allFormInputs}
            properties={properties}
            onChange={onChange}
            isSettingDrawerOpen={isDrawerOpen}
          />
        </SheetContent>
      </Sheet>
      <style>
        {`
           .btn-icon {
              width: 30px;
              height: 30px;
              border-radius: 50%;
              cursor: pointer;
              margin-right: 5px;
             
            }
            .btn-action{
              transition: 0.3s;
              cursor: pointer;
            }
            .no-scrollbar::-webkit-scrollbar {
            display: none;
            }
            .no-scrollbar {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
            }
            .custom-checkbox input[type="checkbox"] {
                opacity: 0;
                position: absolute;
                width: 0;
                height: 0;
            }

            /* Tạo hộp tùy chỉnh */
            .custom-checkbox input[type="checkbox"] + label {
                display: flex;
                align-items: center;
                cursor: pointer;
                position: relative;
                padding-left: 1.5rem; /* Khoảng cách giữa hộp và nhãn */
                user-select: none;
            }

            /* Hộp tùy chỉnh */
            .custom-checkbox input[type="checkbox"] + label::before {
                content: '';
                display: inline-block;
                width: 50px !important; /* Chiều rộng của hộp */
                height: 50px !important; /* Chiều cao của hộp */
                border: 2px solid #d1d5db; /* Màu viền hộp */
                border-radius: 0.25rem; /* Độ bo góc */
                background-color: #fff; /* Màu nền của hộp */
                transition: background-color 0.2s, border-color 0.2s;
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
            }

            /* Khi checkbox được chọn */
            .custom-checkbox input[type="checkbox"]:checked + label::before {
                background-color: #ffbe76; /* Màu nền khi chọn */
                border-color: #f39c12; /* Màu viền khi chọn */
            }

            /* Khi checkbox được chọn, thêm dấu tích */
            .custom-checkbox input[type="checkbox"]:checked + label::after {
                content: '✓';
                position: absolute;
                left: 0.25rem; /* Đặt dấu tích bên trong hộp */
                top: 50%;
                transform: translateY(-50%);
                color: #fff; /* Màu của dấu tích */
                font-size: 0.75rem; /* Kích thước của dấu tích */
            }

          
          `}
      </style>
    </>
  );
};

export default NodeActions;
