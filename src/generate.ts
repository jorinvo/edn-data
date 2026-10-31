import {
  EDNVal,
  EDNChar,
  EDNKeyword,
  EDNList,
  EDNMap,
  EDNSet,
  EDNSymbol,
  EDNTaggedVal,
  EDNObjectableVal,
} from './types';
import {
  validateKeywordName,
  validateSymbolName,
  validateTagName,
} from './validate';

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
export const tagValue = (tag: string, value: EDNVal): EDNTaggedVal => {
  validateTagName(tag);
  return { tag, val: value };
};

export const toKeyword = (value: string): EDNKeyword => {
  validateKeywordName(value);
  return { key: value };
};

export const toSymbol = (value: string): EDNSymbol => {
  validateSymbolName(value);
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
    validateKeywordName(value.key);
    return `:${value.key}`;
  }

  if (isEDNSymbol(value)) {
    validateSymbolName(value.sym);
    return value.sym;
  }

  if (isEDNList(value)) {
    return `(${value.list.map(toEDNString).join(' ')})`;
  }

  if (isEDNTaggedVal(value)) {
    validateTagName(value.tag);
    return `#${value.tag} ${toEDNString(value.val)}`;
  }

  if (isEDNChar(value)) {
    return `\\${value.char}`;
  }

  throw new TypeError(`Unknown type: ${JSON.stringify(value)}`);
};

export const toEDNStringFromSimpleObject = (
  value: EDNObjectableVal,
  options: { keysAs: 'keyword' | 'string' } = { keysAs: 'keyword' },
): string => {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value
      .map((v) => toEDNStringFromSimpleObject(v, options))
      .join(' ')}]`;
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
      .map(
        ([k, v]: [EDNObjectableVal, EDNObjectableVal]) =>
          `${toEDNStringFromSimpleObject(
            k,
            options,
          )} ${toEDNStringFromSimpleObject(v, options)}`,
      )
      .join(' ')}}`;
  }

  if (value instanceof Set) {
    return `#{${[...value]
      .map((v) => toEDNStringFromSimpleObject(v, options))
      .join(' ')}}`;
  }

  if (typeof value === 'object') {
    return `{${Object.entries(value)
      .map(
        ([k, v]: [string, EDNObjectableVal]) => {
          if (options.keysAs !== 'string') {
            validateKeywordName(k);
          }
          return `${
            options.keysAs === 'string' ? JSON.stringify(k) : `:${k}`
          } ${toEDNStringFromSimpleObject(v, options)}`;
        },
      )
      .join(' ')}}`;
  }

  throw new TypeError(`Unknown type: ${JSON.stringify(value)}`);
};
