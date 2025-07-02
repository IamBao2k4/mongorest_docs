import { RETURN_TYPE } from '../data/enum';
const formatData = (string, returnValue = 2) => {
  try {
    let result = [];
    let arr = string.split('\n');
    arr.map((item) => {
      if (!item) return;
      if (item?.includes?.(':')) {
        let keyArr = item?.split(':');
        //Value
        returnValue == RETURN_TYPE.value && result.push({ key: keyArr[1], value: keyArr[1] });
        //Label
        returnValue == RETURN_TYPE.label && result.push({ key: keyArr[0], value: keyArr[0] });
        //Both
        returnValue == RETURN_TYPE.both && result.push({ key: keyArr[0], value: keyArr[1] });
      } else {
        result.push({ key: item, value: item });
      }
    });
    return result;
  } catch (error) {
    console.log('🚀 ~ formatData ~ error:', error);
  }
};
const formatToDisplay = (arr, returnValue = 2) => {
  let str = '';
  arr?.map?.(
    (item) =>
      (str =
        str +
        (returnValue == RETURN_TYPE.both
          ? `${item?.key}:${item?.value}
`
          : `${item?.key}
`))
  );

  return str;
};
export { formatData, formatToDisplay };
