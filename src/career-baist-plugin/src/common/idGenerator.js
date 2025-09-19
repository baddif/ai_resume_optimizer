// idGenerator.js
let idCounter = 0;

export function generateId(prefix = 'id') {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}
