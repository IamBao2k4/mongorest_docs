import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

import { useContext, useEffect, useState } from 'react';
import { TreeContext } from '../../../context/treeContext';
import { changeNodeAtPath } from 'react-sortable-tree';

const SelectGroupsArray = ({ rowInfo, setSchemaBuider, node, path }) => {
  const [value, setValue] = useState(rowInfo.node.type);

  const {
    treeData,
    setTreeData,
    setHasConverted,
    addIdReferenceToArray,
    hasNodeChanged,
    setHasNodeChanged,
  } = useContext(TreeContext);

  useEffect(() => {
    setValue(rowInfo.node.type);
  }, [rowInfo]);

  function updateTreeData(value) {
    const { path } = rowInfo;
    let newNode;
    if (value === 'string') {
      newNode = {
        id: rowInfo.node.id,
        key: rowInfo.node.key,
        title: rowInfo.node.title,
        type: 'string',
        widget: 'shortAnswer',
      };
      delete newNode.children;
    } else {
      newNode = {
        id: rowInfo.node.id,
        key: rowInfo.node.key,
        title: rowInfo.node.title,
        type: 'object',
      };
      delete newNode.widget;
    }
    const newTree = changeNodeAtPath({
      treeData,
      path,
      getNodeKey: ({ treeIndex }) => treeIndex,
      newNode: newNode,
    });
    if (newTree) {
      setHasNodeChanged(addIdReferenceToArray(node, treeData));
      setTreeData(newTree);
    }
  }

  return (
    <div className='w-full'>
      <Select
        onValueChange={(value) => {
          setValue(value);
          updateTreeData(value);
        }}
        className='w-container'>
        <SelectTrigger className='w-container'>
          <SelectValue placeholder={value.charAt(0).toUpperCase() + value.slice(1)} />
        </SelectTrigger>
        <SelectContent className='custom-select-content'>
          <SelectGroup>
            {/* <SelectLabel>{`Object`}</SelectLabel> */}
            <SelectItem
              className='px-5 custom-select-item'
              value={`object`}>
              {`Object`}
            </SelectItem>
            {/* <SelectLabel>{`String`}</SelectLabel> */}
            <SelectItem
              className='px-5 custom-select-item'
              value={`string`}>
              {`String`}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <style>
        {`
          .w-container{
            width: 100%;
            padding: 0px;
            border: 0px !important;
            
          }
          .custom-select-content{
            width: 100%;
            padding: 0px;
            margin: 0px;
            padding: 0px;
          }
          
          .custom-select-item {
            width: 100%;
            padding: 5px; 
          }
          .shadow-sm{
            --tw-shadow: 0px;
            --tw-shadow-colored: none;
            box-shadow: 0px !important;
          }
        `}
      </style>
    </div>
  );
};

export default SelectGroupsArray;
