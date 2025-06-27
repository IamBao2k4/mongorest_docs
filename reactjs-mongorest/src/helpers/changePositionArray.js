export function changePositionArray(arr, fromIndex, toIndex) {
  const cloneArr = [...arr];
  const [removed] = cloneArr.splice(fromIndex, 1);
  cloneArr.splice(toIndex, 0, removed);
  return cloneArr;
}
