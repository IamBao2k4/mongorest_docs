import {
  convertToTreeData,
  createUniqueKeyGenerator,
  findNodeByPath,
  hasIdReferenceInAncestors,
} from '@/helpers/utils';
import { useEffect, useState } from 'react';
import 'react-sortable-tree/style.css';
import CustomNodeRenderer from './CustomNodeRenderer';
import { TreeContext } from '../context/treeContext';
import SortableTree from 'react-sortable-tree/dist/index.esm.js';
import { useParams } from 'react-router-dom';

const SchemaTreeEditor = ({
  setMainTreeData,
  properties,
  schemaData,
  uiSchemaData,
  schemaBuilder,
  setSchemaBuider,
  definitionData,
  definitionUi,
  categoryHash,
  allFormInputs,
  fields,
  type,
  onChange,
  setIsDrawerOpen,
  handleUpdateSchema,
}) => {
  const [treeData, setTreeData] = useState([convertToTreeData(schemaData)]);
  const [cloneTreeData, setCloneTreeData] = useState(treeData);
  const [hasConverted, setHasConverted] = useState(false);
  useEffect(() => {
    if (!hasConverted) {
      const convertedTreeData = convertToTreeData(schemaData);
      setTreeData([convertedTreeData]);

      setHasConverted(true);
    }
  }, [schemaBuilder]);

  useEffect(() => {
    setCloneTreeData(treeData);
    setSelectedNodes([]);
    setMainTreeData(treeData);
  }, [treeData, hasConverted]);

  const ensureUniqueKeysAtSameLevel = (newTreeData) => {
    const traverseAndEnsureKeys = (nodes, existingKeys = new Set(), level = 0) => {
      const levelKeyMap = new Map();
      return nodes?.map((node) => {
        let currentKey = node.key;
        if (levelKeyMap.has(currentKey)) {
          const generateUniqueKey = createUniqueKeyGenerator();
          currentKey = generateUniqueKey(node.key, existingKeys);
        }
        levelKeyMap.set(currentKey, true);
        existingKeys.add(currentKey);

        return {
          ...node,
          key: currentKey,
          children: node.children
            ? traverseAndEnsureKeys(node.children, existingKeys, level + 1)
            : node.children,
        };
      });
    };
    return traverseAndEnsureKeys(newTreeData[0].children);
  };

  const [selectedNodes, setSelectedNodes] = useState([]);

  const removeNodeById = (treeData, idToRemove) => {
    const removeNodeRecursively = (nodes) => {
      return nodes.filter((node) => {
        if (node.id === idToRemove) {
          setHasNodeChanged(addIdReferenceToArray(node, treeData));
          return false; // Không bao gồm node cần xóa
        }
        if (node.children) {
          node.children = removeNodeRecursively(node.children); // Đệ quy xóa node con
        }
        return true; // Bao gồm node còn lại
      });
    };

    return removeNodeRecursively(treeData);
  };

  const updateNodePaths = (treeData) => {
    const updatePathsRecursively = (nodes, path = []) => {
      return nodes.map((node, index) => {
        const currentPath = [...path, index];
        const updatedNode = { ...node, path: currentPath };
        if (node.children) {
          updatedNode.children = updatePathsRecursively(node.children, currentPath);
        }
        return updatedNode;
      });
    };

    return updatePathsRecursively(treeData);
  };

  const removeMultipleNodes = (nodes) => {
    let newTreeData = [...treeData];
    nodes.forEach((id, idx) => {
      newTreeData = removeNodeById(newTreeData, id);
    });

    // Cập nhật lại đường dẫn cho các node còn lại
    newTreeData = updateNodePaths(newTreeData);

    // Cập nhật state mới
    setTreeData(newTreeData);
    setSelectedNodes([]);
  };

  const [groupFields, setGroupFields] = useState([]);
  const params = useParams();
  const lang = params.lang;

  // useEffect(() => {
  //   const getGroupFields = async () => {
  //     try {
  //       const dataGroupfields = await groupFieldsApi(lang).getGroupFields({
  //         params: { limit: 'all' },
  //       });

  //       if (dataGroupfields) {
  //         // const data = handleDataGroupfields(dataGroupfields.data);
  //         setGroupFields(dataGroupfields.data);
  //       }
  //     } catch (err) {
  //       console.log('🚀 ~ getInitJSON ~ err:', err);
  //     }
  //   };
  //   getGroupFields();
  // }, [lang]);

  const updateNodeByIdReference = (treeData, idToUpdate, newValue) => {
    const updateNodeRecursively = (nodes) => {
      return nodes.map((node) => {
        if (node.idReference === idToUpdate) {
          const convertNewValue = convertToTreeData(newValue);
          return {
            ...convertNewValue,
            idReference: node.idReference,
            key: node.key,
          };
        } else if (node.children) {
          return {
            ...node,
            children: updateNodeRecursively(node.children),
          };
        }

        return node;
      });
    };
    return updateNodeRecursively(treeData);
  };

  const updateTreeDataByGroupFields = (treeData, groupFields) => {
    let newTreeData = [...treeData];
    groupFields.forEach((item, idx) => {
      const newValue = item.jsonschema;
      newTreeData = updateNodeByIdReference(newTreeData, item.id, newValue);
    });

    setTreeData(newTreeData);
  };

  useEffect(() => {
    if (groupFields.length > 0) {
      updateTreeDataByGroupFields(treeData, groupFields);
    }
  }, [groupFields]);

  const [hasNodeChanged, setHasNodeChanged] = useState([]); //check xem node có từng thay đổi không

  const addIdReferenceToArray = (node, treeData, action) => {
    let nodesChangedArr = [...hasNodeChanged];
    if (node?.idReference) {
      if (action !== 'clone' && action !== 'dragdrop') {
        const isExist = nodesChangedArr.some((id) => id === node.id);
        if (!isExist) {
          nodesChangedArr = [...nodesChangedArr, node.id];
        }
      }
    } else {
      if (hasIdReferenceInAncestors(node, treeData)) {
        const nodeId = hasIdReferenceInAncestors(node, treeData);
        const isExist = nodesChangedArr.some((id) => id === nodeId);
        if (!isExist) {
          nodesChangedArr = [...nodesChangedArr, nodeId];
        }
      }
    }
    return nodesChangedArr;
  };
  const removeIdReferencesByIdArray = (treeData, idArray) => {
    const removeIdReferenceRecursively = (nodes) => {
      return nodes.map((node) => {
        if (idArray.includes(node.id)) {
          // Xóa idReference nếu id của node trùng với id trong idArray
          const { idReference, ...rest } = node;
          node = rest;
        }

        // Kiểm tra children của node hiện tại
        if (node.children) {
          node.children = removeIdReferenceRecursively(node.children);
        }

        return node;
      });
    };

    return removeIdReferenceRecursively(treeData);
  };

  useEffect(() => {
    if (hasNodeChanged.length > 0 && selectedNodes.length <= 0) {
      const result = removeIdReferencesByIdArray(treeData, hasNodeChanged);
      setHasNodeChanged([]);
      setTreeData(result);
    }
  }, [hasNodeChanged, selectedNodes]);

  function handleMoveNode({ node, nextParentNode, prevPath, nextPath, treeData, cloneTreeData }) {
    let nodesChangedArr = [];
    //Check id ancestors vị trí cũ của node có idReference ko -> add hasNodeChanged
    const prevNode = findNodeByPath(cloneTreeData, prevPath);
    nodesChangedArr = [
      ...nodesChangedArr,
      ...addIdReferenceToArray(prevNode, cloneTreeData, 'dragdrop'),
    ];
    // Check id ancestors vị trí mới của node có idReference ko -> add hasNodeChanged
    nodesChangedArr = [...nodesChangedArr, ...addIdReferenceToArray(node, treeData, 'dragdrop')];

    if (nodesChangedArr.length > 0) {
      setHasNodeChanged(nodesChangedArr);
    }
  }

  const [errorMessageShown, setErrorMessageShown] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);

  const canDrop = ({ node, nextParent, nextPath, prevPath }) => {
    if (!nextParent) {
      setDraggedNode(node);
      return false;
    }
    if (nextPath.length === 1) {
      setDraggedNode(node);
      return false;
    }
    if (nextParent.widget || nextParent.type === 'array') {
      setDraggedNode(node);
      return false;
    }
    setDraggedNode(null);
    return true;
  };

  useEffect(() => {
    if (draggedNode) {
      setErrorMessageShown(true);
    } else {
      setErrorMessageShown(false);
    }
  }, [draggedNode]);

  return (
    <div className='schema-tree-editor relative flex-1 flex pb-8 overflow-hidden'>
      {selectedNodes.length > 0 && (
        <div
          className='remove-box fixed flex flex-1'
          style={{
            bottom: '5%',
            zIndex: '3',
            left: '50%',
            transform: 'translate(-50%, 0)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'rgb(255, 255, 255)',
            borderRadius: '4px',
            width: '250px',
            height: '64px',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <p className='title mr-2'>({selectedNodes.length}) nodes selected</p>
          <div
            className='btn-remove p-2'
            style={{
              backgroundColor: '#e74c3c',
              width: 'fit-content',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={() => {
              removeMultipleNodes(selectedNodes);
            }}>
            <span
              className='text-sm font-medium'
              style={{ color: '#fff' }}>
              Remove
            </span>
          </div>
        </div>
      )}
      <div className='container-tree w-full flex mt-2'>
        <div className='flex-1'>
          <div
            className='flex flex-row z-1 justify-between text-white mx-auto rounded-t'
            style={{ background: 'rgb(44, 62, 80)' }}>
            <div className='w-1/12 max-w-[40px] border-l border-r px-3 py-3 text-left text-sm font-medium tracking-wider'></div>
            <div className='w-1/12 max-w-[40px] border-r px-3 py-3 text-left text-sm font-medium tracking-wider'></div>
            <div className='w-1/12 max-w-[40px] border-r px-3 py-3 text-left text-sm font-medium tracking-wider'></div>
            <div className='w-1/3 border-r px-3 py-4 text-left text-sm font-medium tracking-wider'>
              Display Name
            </div>
            <div className='w-1/6 border-r px-3 py-4 text-left text-sm font-medium tracking-wider'>
              Key
            </div>
            <div className='w-1/6 border-r px-3 py-4 text-left text-sm font-medium tracking-wider'>
              Fields
            </div>
            <div className='w-1/6 border-r px-3 py-4 text-left text-sm font-medium tracking-wider'>
              Description
            </div>
            <div className='w-1/6 border-r px-3 py-4 text-left text-sm font-medium tracking-wider'>
              Actions
            </div>
          </div>
          <TreeContext.Provider
            value={{
              treeData,
              setTreeData,
              hasConverted,
              setHasConverted,
              fields,
              type,
              properties,
              selectedNodes,
              setSelectedNodes,
              groupFields,
              hasNodeChanged,
              setHasNodeChanged,
              addIdReferenceToArray,
            }}>
            <div className='h-full overflow-auto'>
              <SortableTree
                key={JSON.stringify(treeData)}
                isVirtualized={false}
                treeData={treeData}
                onChange={(newtreeData) => {
                  setCloneTreeData(treeData);
                  const updatedTreeData = ensureUniqueKeysAtSameLevel(newtreeData);
                  newtreeData[0].children = updatedTreeData;
                  setTreeData(newtreeData);
                  handleUpdateSchema(newtreeData);
                }}
                onMoveNode={({ node, nextParentNode, prevPath, nextPath, treeData }) => {
                  handleMoveNode({
                    node,
                    nextParentNode,
                    prevPath,
                    nextPath,
                    treeData,
                    cloneTreeData,
                  });
                }}
                canDrop={canDrop}
                nodeContentRenderer={(props) => {
                  return (
                    <CustomNodeRenderer
                      {...props}
                      schemaBuilder={schemaBuilder}
                      setSchemaBuider={setSchemaBuider}
                      schemaData={schemaData}
                      uiSchemaData={uiSchemaData}
                      definitionData={definitionData}
                      definitionUi={definitionUi}
                      categoryHash={categoryHash}
                      allFormInputs={allFormInputs}
                      properties={properties}
                      onChange={onChange}
                      setIsDrawerOpen={setIsDrawerOpen}
                      handleUpdateSchema={handleUpdateSchema}
                    />
                  );
                }}
              />
            </div>
          </TreeContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default SchemaTreeEditor;
