export function formatChildsToChildren(arr) {
  try {
    return arr?.map((item) => {
      // Create a new object with the reformatted structure
      const formattedItem = {
        ...item,
        key: item._id, // Add key field with _id value
        children: [], // Initialize with empty array
      };

      // If there are children (childs), format them recursively
      if (item.childs && Array.isArray(item.childs)) {
        formattedItem.children = formatChildsToChildren(item.childs);
      }

      // Delete the old childs property
      delete formattedItem.childs;

      return formattedItem;
    });
  } catch (error) {
    console.log('🚀 ~ formatChildsToChildren ~ error:', error);
    return [];
  }
}
