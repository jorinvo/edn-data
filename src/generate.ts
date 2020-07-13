import {
  EDNVal,
  EDNChar,
  EDNKeyword,
  EDNList,
  EDNMap,
  EDNSet,
  EDNSymbol,
  EDNTaggedVal,
} from './types';

const isEDNKeyword = (value: Record<string, EDNVal>): value is EDNKeyword => {
  return value.key !== undefined;
};

const isEDNSymbol = (value: Record<string, EDNVal>): value is EDNSymbol => {
  return value.sym !== undefined;
};

const isEDNMap = (
  value: Record<string, EDNVal | [EDNVal, EDNVal][]>,
): value is EDNMap => {
  return value.map !== undefined;
};

const isEDNSet = (
  value: Record<string, EDNVal | EDNVal[]>,
): value is EDNSet => {
  return value.set !== undefined;
};

const isEDNList = (
  value: Record<string, EDNVal | EDNVal[]>,
): value is EDNList => {
  return value.list !== undefined;
};

const isEDNTaggedVal = (
  value: Record<string, EDNVal>,
): value is EDNTaggedVal => {
  return value.tag !== undefined;
};

const isEDNChar = (value: Record<string, EDNVal>): value is EDNChar => {
  return value.char !== undefined;
};
// TODO: Tag has char restrictions
export const tagValue = (tag: string, value: EDNVal): EDNTaggedVal => {
  return { tag, val: value };
};

// TODO: Keyword has char restrictions
export const toKeyword = (value: string): EDNKeyword => {
  return { key: value };
};

// TODO: Symbol has char restrictions
export const toSymbol = (value: string): EDNSymbol => {
  return { sym: value };
};

export const toEDNString = (value: EDNVal): string => {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(toEDNString).join(' ')}]`;
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'boolean') {
    return JSON.stringify(value);
  }

  if (value === null) {
    return 'nil';
  }

  if (value instanceof Date) {
    return `#inst "${value.toISOString()}"`;
  }

  if (typeof value === 'bigint') {
    return `${value}N`;
  }

  if (value instanceof Map) {
    return `{${[...value]
      .map(([k, v]: [EDNVal, EDNVal]) => `${toEDNString(k)} ${toEDNString(v)}`)
      .join(' ')}}`;
  }

  if (value instanceof Set) {
    return `#{${[...value].map(toEDNString).join(' ')}}`;
  }

  if (isEDNMap(value)) {
    return `{${value.map
      .map(([k, v]: [EDNVal, EDNVal]) => `${toEDNString(k)} ${toEDNString(v)}`)
      .join(' ')}}`;
  }

  if (isEDNSet(value)) {
    return `#{${value.set.map(toEDNString).join(' ')}}`;
  }

  if (isEDNKeyword(value)) {
    return `:${value.key}`;
  }

  if (isEDNSymbol(value)) {
    return value.sym;
  }

  if (isEDNList(value)) {
    return `(${value.list.map(toEDNString).join(' ')})`;
  }

  if (isEDNTaggedVal(value)) {
    return `#${value.tag} ${toEDNString(value.val)}`;
  }

  if (isEDNChar(value)) {
    return `\${value.char}`;
  }

  throw new TypeError(`Unknown type: ${JSON.stringify(value)}`);
};
