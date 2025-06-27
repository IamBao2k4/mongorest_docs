import { useContext, useEffect, useState } from 'react';
import { excludeKeys } from '@/helpers/utils';
import { TreeContext } from '../../../../context/treeContext';
import { Switch } from 'antd';
import { changeNodeAtPath } from 'react-sortable-tree';

const AdditionalSettings = ({
  nodeType,
  rowInfo,
  node,
  schemaBuilder,
  setSchemaBuider,
  schemaData,
  uiSchemaData,
  definitionData,
  definitionUi,
  categoryHash,
  properties,
  onChange,
  isSettingDrawerOpen,
  nodeKey,
}) => {
  const {
    treeData,
    setTreeData,
    fields,
    setHasConverted,
    addIdReferenceToArray,
    hasNodeChanged,
    setHasNodeChanged,
  } = useContext(TreeContext);

  const allFormInputs = excludeKeys(Object.assign({}, fields));

  function getInputComponent(category, allFormInputs) {
    return (allFormInputs[category] && allFormInputs[category].modalBody) || (() => null);
  }
  const Render = getInputComponent(
    node.type === 'array'
      ? 'array'
      : node.widget === 'numberInput'
      ? 'number'
      : node.widget === 'UriKeyGen'
      ? 'autoGenKeyFromAnotherField'
      : node.widget,
    allFormInputs
  );

  // const filteredSchema = findSchemaByKey(schemaData.properties, nodeKey);
  const [componentPropsState, setComponentProps] = useState(node);
  const [dependenciesState, setDependenciesState] = useState(() => {
    return null;
  });
  useEffect(() => {
    setComponentProps({
      ...node,
      ...(dependenciesState && { dependents: dependenciesState }),
    });
  }, [node, dependenciesState]);

  const [isRequiredSwitchOn, setIsRequiredSwitchOn] = useState(node.require);
  const [isFilterSwitchOn, setIsFilterSwitchOn] = useState(node.filter);
  const [isDisabledSwitchOn, setIsDisabledSwitchOn] = useState(node.disabled);
  const [isHiddenSwitchOn, setIsHiddenSwitchOn] = useState(node.hidden);

  const getNodeKey = ({ treeIndex }) => treeIndex;
  function updateTreeData(treeData, newValue, currentNode) {
    const path = rowInfo.path;
    const newTree = changeNodeAtPath({
      treeData,
      path,
      getNodeKey,
      newNode: {
        ...newValue,
      },
    });
    setHasNodeChanged(addIdReferenceToArray(node, treeData));
    setTreeData(newTree);
  }

  useEffect(() => {
    if (!isSettingDrawerOpen) {
      const newValue = {
        ...componentPropsState,
        require: isRequiredSwitchOn,
        filter: isFilterSwitchOn,
        disabled: isDisabledSwitchOn,
        hidden: isHiddenSwitchOn,
      };
      updateTreeData(treeData, newValue, node);
    }
  }, [isSettingDrawerOpen]);

  return (
    <div
      className='flex-col'
      style={{
        fontSize: '14px',
      }}>
      <div className='toggle-switch flex items-center mt-2 mb-5'>
        {nodeType !== 'object' && (
          <>
            <div className='switch mr-5'>
              <Switch
                size='small'
                checked={isRequiredSwitchOn}
                onChange={() => {
                  setIsRequiredSwitchOn(!isRequiredSwitchOn);
                }}
              />
              <label
                className='ml-1'
                htmlFor=''>
                Require
              </label>
            </div>
            <div className='switch mr-5'>
              <Switch
                size='small'
                checked={isFilterSwitchOn}
                onChange={() => {
                  setIsFilterSwitchOn(!isFilterSwitchOn);
                }}
              />
              <label
                className='ml-1'
                htmlFor=''>
                Filter
              </label>
            </div>
            <div className='switch mr-5'>
              <Switch
                size='small'
                checked={isDisabledSwitchOn}
                onChange={() => {
                  setIsDisabledSwitchOn(!isDisabledSwitchOn);
                }}
              />
              <label
                className='ml-1'
                htmlFor=''>
                Disabled
              </label>
            </div>
          </>
        )}
        <div className='switch'>
          <Switch
            size='small'
            checked={isHiddenSwitchOn}
            onChange={() => {
              setIsHiddenSwitchOn(!isHiddenSwitchOn);
            }}
          />
          <label
            className='ml-1'
            htmlFor=''>
            Hidden
          </label>
        </div>
      </div>
      {nodeType !== 'object' && (
        <Render
          parameters={componentPropsState}
          neighborNames={componentPropsState?.neighborNames || []}
          onChange={(newState) => {
            const updatedComponentProps = {
              ...componentPropsState,
              ...newState,
            };
            // console.log('🚀 ~ newState:', newState);
            setComponentProps(updatedComponentProps);
          }}
        />
      )}

      <style>
        {`
          .ant-switch-checked {
            background-color: rgb(61, 172, 120) !important; 
          }
        `}
      </style>
    </div>
  );
};

export default AdditionalSettings;
