export const resetObject = (object) => {
  const deepClone = JSON.parse(JSON.stringify(object));

  for (let key in deepClone) {
    deepClone[key] = null;
  }

  deepClone.isSelected = false;

  return deepClone;
};
