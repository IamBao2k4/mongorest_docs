import React, { useEffect, useState } from 'react';
import Trigger from 'rc-trigger';
import Tree, { TreeNode } from 'rc-tree';
import { createListToTree } from '@/helpers/listToTree';
import 'rc-tree/assets/index.css';
import { Input } from '@/components/ui/Input';

const placements = {
  topLeft: {
    points: ['bl', 'tl'],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
    offset: [0, -3],
    targetOffset: [0, 0],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
    offset: [0, 3],
    targetOffset: [0, 0],
  },
};

const DropdownTree = ({
  prefixCls = 'demo-dropdown-tree',
  trigger = ['hover'],
  overlayClassName = '',
  overlayStyle = {},
  defaultVisible = false,
  onVisibleChange = () => {},
  placement = 'bottomLeft',
  visible: propVisible,
  overlay,
  children,
  transitionName,
  animation,
  align,
}) => {
  const [visible, setVisible] = useState(propVisible !== undefined ? propVisible : defaultVisible);

  React.useEffect(() => {
    if (propVisible !== undefined) {
      setVisible(propVisible);
    }
  }, [propVisible]);

  const handleVisibleChange = (v) => {
    if (propVisible === undefined) {
      setVisible(v);
    }
    onVisibleChange(v);
  };

  const getPopupElement = () => {
    return React.cloneElement(overlay, {
      onClick: (e) => {
        if (overlay.props.onClick) {
          overlay.props.onClick(e);
        }
        if (propVisible === undefined) {
          setVisible(false);
        }
      },
    });
  };

  return (
    <Trigger
      prefixCls={prefixCls}
      popupClassName={overlayClassName}
      popupStyle={overlayStyle}
      builtinPlacements={placements}
      action={trigger}
      popupPlacement={placement}
      popupAlign={align}
      popupTransitionName={transitionName}
      popupAnimation={animation}
      popupVisible={visible}
      popup={getPopupElement()}
      onPopupVisibleChange={handleVisibleChange}>
      {children}
    </Trigger>
  );
};

const TreeDropdown = ({ getData, value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState([]);
  let filterKeys = [];

  const [data, setData] = useState([]);

  const fetchTree = async () => {
    try {
      const response = await getData({});
      const _data = JSON.parse(JSON.stringify(response.data)).map((item) => ({
        ...item,
        parent_id: item.parent_id?.[0]?._id,
      }));
      setExpandedKeys(JSON.parse(JSON.stringify(_data)).map((item) => item._id));
      setData(createListToTree(_data));
    } catch (error) {
      console.error('Error fetching tree:', error);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const handleVisibleChange = (v) => {
    setVisible(v);
  };

  const handleSelect = (selectedKeys, info) => {
    setVisible(false);
    onChange([{ _id: selectedKeys[0], ...info.node }]);
  };

  const handleExpand = (keys) => {
    filterKeys = undefined;
    setExpandedKeys(keys);
  };

  const filterTreeNode = (treeNode) => {
    return filterFn(treeNode.props.eventKey);
  };

  const filterFn = (key) => {
    return inputValue && key.indexOf(inputValue) > -1;
  };

  const loop = (d) =>
    d.map((item) => {
      if (filterKeys && filterFn(item.key)) {
        filterKeys.push(item.key);
      }
      if (item.children) {
        return (
          <TreeNode
            key={item.key}
            title={item.title}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          key={item.key}
          title={item.title}
        />
      );
    });

  const overlay = (
    <div>
      <Tree
        onExpand={handleExpand}
        expandedKeys={expandedKeys}
        onSelect={handleSelect}
        showIcon={false}
        filterTreeNode={filterTreeNode}>
        {loop(data)}
      </Tree>
    </div>
  );

  return (
    <DropdownTree
      trigger={['click']}
      onVisibleChange={handleVisibleChange}
      visible={visible}
      overlay={overlay}
      animation='slide-up'>
      <Input
        value={value?.[0]?.title}
      />
    </DropdownTree>
  );
};

export default TreeDropdown;
