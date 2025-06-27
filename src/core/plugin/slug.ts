function createSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  return text
    .toLowerCase()
    .trim()
    // Replace Vietnamese characters
    .replace(/[àáạảã]/g, 'a')
    .replace(/[èéẹẻẽ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõ]/g, 'o')
    .replace(/[ùúụủũ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

export function addSlug(
  data: any,
  sourceField: string = 'title',
  targetField: string = 'slug',
  customSlug?: string
): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => addSlug(item, sourceField, targetField, customSlug));
    } else {
      let slugValue: string;
      
      if (customSlug) {
        if (!isValidSlug(customSlug)) {
          throw new Error('Custom slug must be valid (lowercase, alphanumeric, hyphens only)');
        }
        slugValue = customSlug;
      } else {
        const sourceValue = data[sourceField];
        if (!sourceValue) {
          throw new Error(`Source field '${sourceField}' not found or empty`);
        }
        slugValue = createSlug(sourceValue);
      }

      return {
        ...data,
        [targetField]: slugValue,
      };
    }
  }
  return data;
}

console.log(addSlug({ title: "Hello World!" })); // { title: "Hello World!", slug: "hello-world" }
console.log(addSlug({ name: "Xin chào Việt Nam" }, 'name')); // { name: "Xin chào Việt Nam", slug: "xin-chao-viet-nam" }
console.log(addSlug([{ title: "Post 1" }, { title: "Post 2" }]));
// [{ title: "Post 1", slug: "post-1" }, { title: "Post 2", slug: "post-2" }]