// TODO: support chars
// TODO: support bigint
// TODO: support comment
// TODO: support discard
// TODO: separate generation and parsing into files
// TODO: keywords should contain a single slash
// TODO: Can you tag a tagged val?
// TODO: keywords and symbols need some care with characters
// TODO: tag if not one of the well known must contain exactly one slash
// TODO: What happens with empty doc
// TODO: Error when wrong closing tag
// TODO: Streaming maybe
// TODO: test edn generation

import * as stream from 'stream';

export type EDNVal = EDNTaggableVal | EDNTaggedVal | Date;
export type EDNTaggableVal =
  | EDNMap
  | EDNVector
  | EDNSet
  | Map<EDNVal, EDNVal>
  | Set<EDNVal>
  | string
  | number
  | boolean
  | null
  | bigint
  | EDNKeyword
  | EDNChar
  | EDNSymbol
  | EDNList;
export type EDNMap = { map: [EDNVal, EDNVal][] };
export type EDNVector = EDNVal[];
export type EDNSet = { set: EDNVal[] };
export type EDNKeyword = { key: string };
export type EDNChar = { char: string };
export type EDNSymbol = { sym: string };
export type EDNList = { list: EDNVal[] };
export type EDNTaggedVal = { tag: string; val: EDNVal };
type EDNValOrObject = EDNVal | { [key: string]: EDNValOrObject };

interface ParseOptions {
  mapAs?: 'doubleArray' | 'object' | 'map';
  setAs?: 'object' | 'array' | 'set';
  keywordAs?: 'object' | 'string';
  listAs?: 'object' | 'array';
}

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

enum ParseMode {
  idle,
  string,
  escape,
}
enum StackItem {
  vector,
  list,
  map,
  set,
  tag,
}
const stringEscapeMap = {
  t: '\t',
  r: '\r',
  n: '\n',
  '\\': '\\',
  '"': '"',
};
const spaceChars = [',', ' ', '\t', '\n', '\r'];
const intRegex = /^[-+]?(0|[1-9][0-9]*)$/;
const floatRegex = /^[-+]?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?(0|[1-9][0-9]*))?M?$/;

export class ParseEDNListSteam extends stream.Transform {
  stack = [];
  mode = ParseMode.idle;
  state = '';
  result: EDNVal | undefined;
  started = false;

  mapAs: ParseOptions['mapAs'];
  setAs: ParseOptions['setAs'];
  keywordAs: ParseOptions['keywordAs'];
  listAs: ParseOptions['listAs'];

  constructor({
    mapAs = 'doubleArray',
    setAs = 'object',
    keywordAs = 'object',
    listAs = 'object',
  }: ParseOptions = {}) {
    super({ readableObjectMode: true });
    this.mapAs = mapAs;
    this.setAs = setAs;
    this.keywordAs = keywordAs;
    this.listAs = listAs;
  }

  updateStack() {
    if (this.stack.length === 0 || this.result === undefined) {
      return;
    }
    const [stackItem, prevState] = this.stack[this.stack.length - 1];
    if (stackItem === StackItem.vector) {
      prevState.push(this.result);
    } else if (stackItem === StackItem.list) {
      prevState.push(this.result);
    } else if (stackItem === StackItem.set) {
      prevState.push(this.result);
    } else if (stackItem === StackItem.map) {
      if (prevState[1].length > 0) {
        prevState[0].push([prevState[1].pop(), this.result]);
      } else {
        prevState[1].push(this.result);
      }
    } else if (stackItem === StackItem.tag) {
      this.stack.pop();
      if (prevState === 'inst') {
        // TODO: what if invalid date?
        this.result = new Date(this.result as string);
        return;
      }
      this.result = { tag: prevState, val: this.result };
      return;
    }
    //   // TODO: Else error
    this.result = undefined;
  }

  match() {
    if (this.state === 'nil') {
      this.result = null;
    } else if (this.state === 'true') {
      this.result = true;
    } else if (this.state === 'false') {
      this.result = false;
    } else if (this.state[0] === ':') {
      this.result =
        this.keywordAs === 'string'
          ? this.state.substr(1)
          : { key: this.state.substr(1) };
    } else if (this.state[0] === '#') {
      this.stack.push([StackItem.tag, this.state.substr(1)]);
      this.result = undefined;
    } else if (intRegex.test(this.state)) {
      this.result = parseInt(this.state, 10);
    } else if (floatRegex.test(this.state)) {
      this.result = parseFloat(this.state);
    } else if (this.state !== '') {
      this.result = { sym: this.state };
    }
    this.state = '';
  }

  _transform(chunk, encoding, callback) {
    // TODO encoding
    const edn = chunk.toString();
    for (let i = 0; i < edn.length; i++) {
      if (this.stack.length === 0 && this.result !== undefined) {
        this.push(this.result);
        this.result = undefined;
      }

      const char = edn[i];
      if (this.mode === ParseMode.idle) {
        if (char === '"') {
          this.mode = ParseMode.string;
          this.state = '';
          continue;
        }
        if (spaceChars.includes(char)) {
          this.match();
          this.updateStack();
          continue;
        }
        if (char === '}') {
          this.match();
          this.updateStack();
          const [stackItem, prevState] = this.stack.pop();
          if (stackItem === StackItem.map) {
            // TODO: What if map is closed too early?
            if (this.mapAs === 'object') {
              // TODO: what if map has non-stringable keys? keys as JSON?
              this.result = prevState[0].reduce((memo, [k, v]) => {
                return { ...memo, [k]: v };
              }, {});
            } else if (this.mapAs === 'map') {
              this.result = new Map(prevState[0]);
            } else {
              this.result = { map: prevState[0] };
            }
          } else {
            if (this.setAs === 'array') {
              this.result = prevState;
            } else if (this.setAs === 'set') {
              this.result = new Set(prevState);
            } else {
              this.result = { set: prevState };
            }
          }
          this.updateStack();
          continue;
        }
        if (char === ']') {
          this.match();
          this.updateStack();
          const [stackItem, prevState] = this.stack.pop();
          this.result = prevState;
          this.updateStack();
          continue;
        }
        if (char === ')') {
          this.match();
          this.updateStack();
          if (this.stack.length === 0) {
            if (this.result !== undefined) {
              this.push(this.result);
            }
            this.push(null);
            callback();
            return;
          }
          const [stackItem, prevState] = this.stack.pop();
          if (this.listAs === 'array') {
            this.result = prevState;
          } else {
            this.result = { list: prevState };
          }
          this.updateStack();
          continue;
        }
        if (char === '[') {
          this.stack.push([StackItem.vector, []]);
          continue;
        } else if (char === '(') {
          if (!this.started) {
            this.started = true;
            continue;
          }
          this.stack.push([StackItem.list, []]);
          continue;
        }

        this.state += char;

        if (this.state === '{') {
          this.stack.push([StackItem.map, [[], []]]);
          this.state = '';
        } else if (this.state === '#{') {
          this.stack.push([StackItem.set, []]);
          this.state = '';
        }
        continue;
      } else if (this.mode === ParseMode.string) {
        if (char === '\\') {
          this.stack.push([this.mode, this.state]);
          this.mode = ParseMode.escape;
          this.state = '';
          continue;
        }
        if (char === '"') {
          this.mode = ParseMode.idle;
          this.result = this.state;
          this.updateStack();
          this.state = '';
          continue;
        }
        this.state += char;
      } else if (this.mode === ParseMode.escape) {
        // TODO what should happen when escaping other char
        const escapedChar = stringEscapeMap[char];
        const [stackItem, prevState] = this.stack.pop();
        this.mode = stackItem;
        this.state = prevState + escapedChar;
      }
    }
    callback();
  }
}

export const parseEDNListStream = (parseOptions?: ParseOptions) => {
  return new ParseEDNListSteam(parseOptions);
};

export const parseEDNString = (
  edn: string,
  parseOptions?: ParseOptions,
): EDNValOrObject => {
  const s = parseEDNListStream(parseOptions);
  s.write('(' + edn + ')');
  return s.read();
};
