import { Transform } from 'class-transformer';

export function ToLowerCase() {
  return Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value));
}

export function ToLowerCaseArray() {
  return Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(v => typeof v === 'string' ? v.toLowerCase() : v);
    }
    return typeof value === 'string' ? value.toLowerCase() : value;
  });
}