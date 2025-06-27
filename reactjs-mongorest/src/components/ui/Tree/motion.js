/**
 * Hàm tạo hiệu ứng collapse cho Tree component
 */
export function getTreeMotion() {
  return {
    motionName: 'rc-tree-motion-collapse',
    motionAppear: false,
    onAppearStart: () => ({ height: 0 }),
    onAppearActive: (node) => {
      return { height: node.scrollHeight - 24 };
    },
    onAppearEnd: (node) => ({ height: 0 }),

    onLeaveStart: (node) => ({ height: node.offsetHeight }),
    onLeaveActive: () => ({ height: 0 }),
    onLeaveEnd: () => null,
  };
}
