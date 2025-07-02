import { Button } from '@/components/ui/Button';
import React from 'react';

const renderNodeAsJSX = (nodes, level = 0, parentKey = '') => {
  const renderNodes = (node, indent = '') => {
    if (!node) return '';

    const currentKey = parentKey ? `${parentKey} --> ${node.key}` : node.key;
    const childrenOutput = node.children
      ? node.children.map((child) => renderNodes(child, indent + '   ')).join('')
      : '';

    return `// ${indent}- ${currentKey} (type: ${node.type})\n${childrenOutput}`;
  };

  const filteredChildren = nodes.children.filter((child) => child.key !== 'A');

  const nodeStructure = filteredChildren.map((child) => renderNodes(child)).join('');

  const specialCharKeys = filteredChildren
    .map((node) => node.key)
    .filter((key) => /[^a-zA-Z0-9]/.test(key));

  const normalKeys = filteredChildren
    .map((node) => node.key)
    .filter((key) => /^[a-zA-Z0-9]+$/.test(key));

  const hasSpecialCharKeys = specialCharKeys.length > 0;

  // Template for the final JSX output
  const template = `
// Node structure 
${nodeStructure}

const TreeNode = ({ ${normalKeys.join(', ')}${hasSpecialCharKeys ? ', ...props' : ''} }) => {
  ${specialCharKeys
    .map((key) => `const ${key.replace(/[^a-zA-Z0-9]/g, '')} = props?.['${key}'];`)
    .join('\n  ')}
  
  return (
    <div>
      {/* Component JSX goes here */}
    </div>
  );
};

export default TreeNode;
`;

  return template;
};

// // Node structure
// // - music (type: object)
// //    - newInput1 (type: object)
// //       - newInput1 (type: object)
// // - music-1 (type: object)
// //    - newInput1 (type: object)
// //    - newInput2 (type: string)

// const TreeNode = ({music, ...props}) => {
//   const music1 = props?.['music-1']
//   return (
//     <div>
//       {/* Component JSX goes here */}
//     </div>
//   );
// };

const renderTreeData = (nodes, indentation = 0, isChild = false) => {
  return nodes.map((node, index) => (
    <div
      key={node.key}
      className='tree-node'>
      <div
        className='btn-item w-fit text-xs px-3 py-2 cursor-pointer mr-1 mb-2'
        style={{
          marginLeft: `${indentation * 50}px`,
          backgroundColor: !isChild
            ? 'rgba(231,76,60,0.2)'
            : node.widget || node.type === 'array'
            ? 'rgba(61, 172, 120, 0.2)'
            : 'rgba(72,126,176, 0.2)',

          color: !isChild
            ? 'rgb(231,76,60)'
            : node.widget || node.type === 'array'
            ? 'rgb(61, 172, 120)'
            : 'rgb(72,126,176)',
          fontWeight: '600',
          borderRadius: '4px',
          position: 'relative',
        }}>
        {`${node.key} (type : ${node.type})`}
      </div>

      {node.children && node.children.length > 0 && (
        <div className='child-node'>{renderTreeData(node.children, indentation + 1, true)}</div>
      )}
    </div>
  ));
};

const Export = ({ treeData }) => {
  const handleCopy = () => {
    const template = renderNodeAsJSX(treeData[0]);
    navigator.clipboard.writeText(template).then(
      () => {},
      (err) => {}
    );
  };
  return (
    <>
      {treeData[0].children && treeData[0].children.length > 0 && (
        <div>
          <div className='px-5 py-0'>
            <div className='flex items-center justify-between'>
              <p className='title text-md font-medium mb-2'>Tree Data as Jsx</p>
              <Button
                style={{
                  background: '#333',
                  color: '#fff',
                }}
                type='primary'
                className='w-24'
                onClick={handleCopy}>
                Copy
              </Button>
            </div>

            <pre>{renderNodeAsJSX(treeData[0])}</pre>
          </div>
        </div>
      )}
      <style>
        {`
          .tree-node {
            position: relative;
          }

          .line-vertical {
            position: absolute;
            width: 2px;
            background-color: black;
          }

          .tree-node .child-node {
            position: relative;
          }

          // .tree-node .btn-item::before {
          //   content: '';
          //   position: absolute;
          //   width: 5px;
          //   height: 5px;
          //   border-radius: 50%;
          //   background-color: black;
          //   left: -20px;
          //   top: 50%;
          // }
      
        `}
      </style>
    </>
  );
};

export default Export;
