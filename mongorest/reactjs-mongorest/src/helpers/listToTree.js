export const createListToTree = (list, isMenu = false) => {
  let map = {},
    node,
    roots = [],
    i;

  for (i = 0; i < list.length; i += 1) {
    map[list[i]._id] = i;
    list[i].children = [];
  }

  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (node.parent_id) {
      list[map[node.parent_id]]?.children?.push({
        ...node,
        title: node.name || node.title,
        expanded: true,
        item: node,
        key: node?._id || node?.slug,
        icon: !isMenu ? node.icon : null,
      });
    } else {
      roots.push({
        ...node,
        title: node.name || node.title,
        expanded: true,
        item: node,
        key: node?._id || node?.slug,
        icon: !isMenu ? node.icon : null,
      });
    }
  }

  return roots;
};
