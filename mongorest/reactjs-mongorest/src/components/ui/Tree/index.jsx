// Tree.jsx
import React, { useEffect } from 'react';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import './treeStyles.css';
import { ChevronRight, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTreeMotion } from './motion';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ContextMenu';
import { useState } from 'react';

const SwitcherIcon = ({ expanded, isLeaf }) => {
  if (isLeaf) {
    return null; // Không hiển thị icon cho node lá
  }

  return (
    <ChevronRight
      className={cn(
        'w-4 h-4 transition-transform duration-250',
        expanded ? 'rotate-90' : 'rotate-0'
      )}
    />
  );
};

const actions = [
  {
    key: 'add',
    name: 'Thêm',
    icon: <FolderPlus className='w-4 h-4' />,
  },
  {
    key: 'edit',
    name: 'Chỉnh sửa',
    icon: <FolderPlus className='w-4 h-4' />,
  },
  {
    key: 'delete',
    name: 'Xóa',
    icon: <FolderPlus className='w-4 h-4' />,
  },
];

const TreeDemo = ({
  className,
  data = [],
  defaultExpandAll = false,
  defaultExpandedKeys = [],
  multiple = false,
  checkable = false,
  draggable = false,
  allowDrop,
  onDrop,
  motion = true,
  entity,
  cacllbackAction,
  ...props
}) => {
  const [expandedKeys, setExpandedKeys] = useState(defaultExpandedKeys);
  const [selectedKeys, setSelectedKeys] = useState(props?.selectedKeys || []);
  const [checkedKeys, setCheckedKeys] = useState(props?.checkedKeys || []);
  const [treeData, setTreeData] = useState(data);

  useEffect(() => {
    if (props?.selectedKeys) {
      setSelectedKeys(props?.selectedKeys);
    }
  }, [props?.selectedKeys]);

  // Custom styles để phù hợp với thiết kế shadcn
  const treeStyles = {
    '--rc-tree-node-selected-bg': 'hsl(var(--primary) / 0.1)',
    '--rc-tree-node-hover-bg': 'hsl(var(--muted) / 0.5)',
    '--rc-tree-switcher-leaf-line': 'transparent',
  };

  // Thiết lập animation
  const motionSettings = motion ? getTreeMotion() : false;

  // Component cho custom tree node
  const renderTreeNodes = (data) => {
    return data.map((item) => {
      const className = item.className || '';

      if (item.children) {
        return (
          <Tree.TreeNode
            key={item.key}
            title={
              <ContextMenu>
                <ContextMenuTrigger>
                  <div className={`flex items-center gap-2 py-2 ${className}`}>
                    {item.icon && <span className='w-4 h-4'>{item.icon}</span>}
                    <div className='flex-1'>
                      <span className='text-xs line-clamp-1 whitespace-normal break-all'>
                        {item.title || 'Empty title...'}
                      </span>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  {actions.map((action) => (
                    <ContextMenuItem
                      key={action.key}
                      onClick={() => handleRightClick({ action: action.key, node: item })}
                      className='gap-1'>
                      {action.name}
                    </ContextMenuItem>
                  ))}
                </ContextMenuContent>
              </ContextMenu>
            }
            isLeaf={item.isLeaf}
            className='py-2'>
            {renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }
      return (
        <Tree.TreeNode
          key={item.key}
          title={
            <ContextMenu>
              <ContextMenuTrigger>
                <div className={`flex items-center gap-2 ${className}`}>
                  {item.icon && <span className='w-4 h-4'>{item.icon}</span>}
                  <div className='flex-1'>
                    <span className='text-xs line-clamp-1 whitespace-normal break-all'>
                      {item.title || 'Empty title...'}
                    </span>
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                {actions.map((action) => (
                  <ContextMenuItem
                    key={action.key}
                    onClick={() => handleRightClick({ action: action.key, node: item })}
                    className='gap-1'>
                    {action.name}
                  </ContextMenuItem>
                ))}
              </ContextMenuContent>
            </ContextMenu>
          }
          isLeaf={item.isLeaf}
          className='py-1'
        />
      );
    });
  };

  const onExpand = (expandedKeys, info) => {
    setExpandedKeys(expandedKeys);

    if (props.onExpand) {
      props.onExpand(expandedKeys, info);
    }
  };

  const onSelect = (selectedKeys, info) => {
    setSelectedKeys(selectedKeys);
    if (props.onSelect) {
      props.onSelect(selectedKeys, info);
    }
  };

  const onCheck = (checkedKeys, info) => {
    setCheckedKeys(checkedKeys);
    if (props.onCheck) {
      props.onCheck(checkedKeys, info);
    }
  };

  const handleRightClick = async ({ action, node }) => {
    cacllbackAction && cacllbackAction({ action, node });
  };
  // Xử lý sự kiện kéo thả
  const handleDrop = (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    // Clone dữ liệu hiện tại
    const data = [...treeData];

    // Tìm item được kéo
    let dragObj;
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          callback(item, index, arr);
          return;
        }
        if (item.children) {
          loop(item.children, key, callback);
        }
      });
    };

    // Xóa item được kéo khỏi vị trí cũ
    let dragParentKey = null;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
      if (arr.length === 0 && data !== arr) {
        loop(data, dropKey, (_, __, parentArr) => {
          if (parentArr && parentArr !== data) {
            dragParentKey = parentArr[0].key;
          }
        });
      }
    });

    if (!info.dropToGap) {
      // Thả vào một node - thêm vào children
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        dragObj.className = 'animate-fade-in';
        item.children.unshift(dragObj);
      });
    } else if (
      (info.node.props.children || []).length > 0 &&
      info.node.props.expanded &&
      dropPosition === 1
    ) {
      // Thả vào vùng mở rộng của một node - thêm vào đầu children
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        dragObj.className = 'animate-fade-in';
        item.children.unshift(dragObj);
      });
    } else {
      // Thả vào khoảng trống - thêm vào cùng cấp
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });

      if (dropPosition === -1) {
        // Thả trước node
        dragObj.className = 'animate-fade-in';
        ar.splice(i, 0, dragObj);
      } else {
        // Thả sau node
        dragObj.className = 'animate-fade-in';
        ar.splice(i + 1, 0, dragObj);
      }
    }

    // Cập nhật dữ liệu
    setTreeData(data);

    // Gọi callback nếu có
    if (onDrop) {
      onDrop(info, data);
    }
  };

  // Kiểm tra xem có cho phép thả không
  const handleAllowDrop = ({ dropNode, dropPosition }) => {
    if (allowDrop) {
      return allowDrop({ dropNode, dropPosition });
    }
    return true;
  };

  useEffect(() => {
    if (data) {
      setTreeData(data);
    }
  }, [data]);

  return (
    <div
      className={cn('text-foreground w-full', className)}
      style={treeStyles}
      {...props}>
      <Tree
        showLine
        showIcon={false}
        checkable={checkable}
        multiple={multiple}
        defaultExpandAll={defaultExpandAll}
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        checkedKeys={checkedKeys}
        onExpand={onExpand}
        onSelect={onSelect}
        onCheck={onCheck}
        draggable={draggable}
        onDrop={handleDrop}
        allowDrop={handleAllowDrop}
        switcherIcon={SwitcherIcon}
        motion={motionSettings}>
        {renderTreeNodes(treeData)}
      </Tree>
    </div>
  );
};

// Hàm hỗ trợ tìm node theo key
const findNodeByKey = (data, key) => {
  let result = null;
  if (!data) return result;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.key === key) {
      return item;
    }
    if (item.children) {
      result = findNodeByKey(item.children, key);
      if (result) {
        return result;
      }
    }
  }
  return result;
};

// Hàm hỗ trợ cập nhật treeData
const updateTreeData = (data, key, updateFn) => {
  return data.map((node) => {
    if (node.key === key) {
      return updateFn(node);
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, updateFn),
      };
    }
    return node;
  });
};

export { TreeDemo as Tree, findNodeByKey, updateTreeData };
