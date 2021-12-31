/**
 * Removes specified element from the array, if it exists
 * @param {*} elem 
 * @param {*} arr 
 * @returns 
 */
export function removeElem(elem, arr) {
  const i = arr.indexOf(elem);
  if (i > -1) arr.splice(i, 1);
  return arr;
}