export function deepFilterKeys(data, allowedKeys) {
  // Trường hợp cơ bản: nếu data không phải object hoặc null
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Trường hợp data là array: xử lý từng phần tử trong array
  if (Array.isArray(data)) {
    return data.map((item) => deepFilterKeys(item, allowedKeys));
  }

  // Trường hợp data là object
  const result = {};

  // Duyệt qua các key được phép
  allowedKeys.forEach((key) => {
    if (key in data) {
      const value = data[key];

      // Xử lý đệ quy dựa trên kiểu dữ liệu của value
      if (value === null) {
        // Giữ nguyên giá trị null
        result[key] = null;
      } else if (Array.isArray(value)) {
        // Nếu value là array, áp dụng đệ quy cho từng phần tử
        result[key] = value.map((item) =>
          typeof item === 'object' && item !== null ? deepFilterKeys(item, allowedKeys) : item
        );
      } else if (typeof value === 'object') {
        // Nếu value là object, áp dụng đệ quy
        result[key] = deepFilterKeys(value, allowedKeys);
      } else {
        // Các kiểu dữ liệu nguyên thủy khác (string, number, boolean...)
        result[key] = value;
      }
    }
  });

  return result;
}
