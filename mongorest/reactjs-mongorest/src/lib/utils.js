import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Process tree data to add additional properties or transform data
 * @param {Array} data - The original tree data
 * @returns {Array} - Processed tree data
 */
export function processTreeData(data) {
  if (!data || !Array.isArray(data)) return [];

  return data.map((node) => {
    const processedNode = { ...node };

    // Process children if they exist
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      processedNode.children = processTreeData(node.children);
    } else {
      // If no children, ensure the node is marked as a leaf
      processedNode.isLeaf = true;
    }

    return processedNode;
  });
}

/**
 * Flatten tree data into a simple array
 * @param {Array} data - The tree data
 * @returns {Array} - Flattened array of nodes
 */
export function flattenTreeData(data) {
  let result = [];

  data.forEach((node) => {
    result.push(node);

    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      result = result.concat(flattenTreeData(node.children));
    }
  });

  return result;
}

/**
 * Get all keys from tree data
 * @param {Array} data - The tree data
 * @returns {Array} - Array of all keys
 */
export function getAllKeys(data) {
  return flattenTreeData(data).map((node) => node.key);
}
