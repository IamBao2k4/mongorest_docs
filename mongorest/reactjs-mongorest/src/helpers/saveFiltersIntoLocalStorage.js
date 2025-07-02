function saveFilterLStorage(slug, filterArrVal, storageKey) {
  let storageData = localStorage.getItem(storageKey);
  if (storageData) {
    storageData = JSON.parse(storageData);
    if (storageData?.hasOwnProperty(storageKey + slug)) {
      storageData[storageKey + slug] = [...filterArrVal];
    } else {
      storageData[storageKey + slug] = filterArrVal;
    }
  } else {
    storageData = {
      [storageKey + slug]: filterArrVal,
    };
  }
  localStorage.setItem(storageKey, JSON.stringify(storageData));
}

export default saveFilterLStorage;
