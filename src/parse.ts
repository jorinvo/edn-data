import { EDNVal } from './types';

export interface ParseOptions {
  mapAs?: 'doubleArray' | 'object' | 'map';
  setAs?: 'object' | 'array' | 'set';
  listAs?: 'object' | 'array';
  keywordAs?: 'object' | 'string';
  charAs?: 'object' | 'string';
  tagHandlers?: { [tag: string]: (val: unknown) => unknown };
}

enum ParseMode {
  idle,
  string,
  escape,
  comment,
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
const bigintRegex = /^[-+]?(0|[1-9][0-9]*)N$/;
const floatRegex = /^[-+]?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?(0|[1-9][0-9]*))?M?$/;

const defaultTagHandlers = {
  inst: (val: EDNVal): Date => {
    if (typeof val !== 'string') {
      throw new Error('#inst value must be a string');
    }
    return new Date(val);
  },
};

export class EDNListParser {
  stack = [];
  mode = ParseMode.idle;
  state = '';
  result: unknown;
  started = false;
  done = false;

  mapAs: ParseOptions['mapAs'];
  setAs: ParseOptions['setAs'];
  keywordAs: ParseOptions['keywordAs'];
  charAs: ParseOptions['charAs'];
  listAs: ParseOptions['listAs'];
  tagHandlers: ParseOptions['tagHandlers'];

  constructor({
    mapAs = 'doubleArray',
    setAs = 'object',
    keywordAs = 'object',
    charAs = 'object',
    listAs = 'object',
    tagHandlers = {},
  }: ParseOptions = {}) {
    this.mapAs = mapAs;
    this.setAs = setAs;
    this.keywordAs = keywordAs;
    this.charAs = charAs;
    this.listAs = listAs;
    this.tagHandlers = { ...defaultTagHandlers, ...tagHandlers };
  }

  updateStack(): void {
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
      if (prevState === '_') {
        this.result = undefined;
      } else {
        const tagHandler = this.tagHandlers[prevState];
        if (tagHandler) {
          this.result = tagHandler(this.result);
        } else {
          this.result = { tag: prevState, val: this.result };
        }
      }
      this.updateStack();
      return;
    }
    // TODO: Else error
    this.result = undefined;
  }

  match(): void {
    if (this.state === 'nil') {
      // nil
      this.result = null;
    } else if (this.state === 'true') {
      // Boolean
      this.result = true;
    } else if (this.state === 'false') {
      this.result = false;
    } else if (this.state[0] === ':') {
      // Keyword
      this.result =
        this.keywordAs === 'string'
          ? this.state.substr(1)
          : { key: this.state.substr(1) };
    } else if (this.state[0] === '#') {
      // Tag
      this.stack.push([StackItem.tag, this.state.substr(1)]);
      this.result = undefined;
    } else if (intRegex.test(this.state)) {
      // Int
      this.result = parseInt(this.state, 10);
    } else if (floatRegex.test(this.state)) {
      // Float
      this.result = parseFloat(this.state);
    } else if (bigintRegex.test(this.state)) {
      this.result = BigInt(this.state.substr(0, this.state.length - 1));
    } else if (this.state[0] === '\\') {
      // Char
      // TODO: invalid if nothing follows the \
      let c: string;
      if (this.state === '\\space') {
        c = ' ';
      } else if (this.state === '\\newline') {
        c = '\n';
      } else if (this.state === '\\return') {
        c = '\r';
      } else if (this.state === '\\tab') {
        c = '	';
      } else if (this.state === '\\\\') {
        c = '\\';
      } else {
        c = this.state.substr(1);
      }
      if (this.charAs === 'string') {
        this.result = c;
      } else {
        this.result = { char: c };
      }
    } else if (this.state !== '') {
      // Symbol
      this.result = { sym: this.state };
    }
    this.state = '';
  }

  next(str: string): (EDNVal | undefined)[] {
    const values = [];
    for (let i = 0; i < str.length; i++) {
      if (this.stack.length === 0 && this.result !== undefined) {
        values.push(this.result);
        this.result = undefined;
      }

      const char = str[i];

      if (this.mode === ParseMode.idle) {
        if (char === '"') {
          this.match();
          this.updateStack();
          this.mode = ParseMode.string;
          this.state = '';
          continue;
        }
        if (char === ';') {
          this.mode = ParseMode.comment;
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
          if (this.stack.length !== 0) {
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
              values.push(this.result);
            }
            this.done = true;
            return values;
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
          this.match();
          this.updateStack();
          this.stack.push([StackItem.vector, []]);
          continue;
        } else if (char === '(') {
          if (!this.started) {
            this.started = true;
            continue;
          }
          this.match();
          this.updateStack();
          this.stack.push([StackItem.list, []]);
          continue;
        }
        const statePlusChar = this.state + char;
        if (statePlusChar === '#_') {
          this.stack.push([StackItem.tag, char]);
          this.result = undefined;
          this.state = '';
          continue;
        }
        if (statePlusChar.endsWith('#{')) {
          this.state = this.state.slice(0, -1);
          this.match();
          this.updateStack();
          this.stack.push([StackItem.set, []]);
          this.state = '';
          continue;
        }
        if (char === '{') {
          this.match();
          this.updateStack();
          this.stack.push([StackItem.map, [[], []]]);
          this.state = '';
          continue;
        }
        this.state += char;
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
      } else if (this.mode === ParseMode.comment) {
        if (char === '\n') {
          this.mode = ParseMode.idle;
        }
      }
    }
    return values;
  }

  isDone(): boolean {
    return this.done;
  }
}

export const parseEDNString = (
  edn: string,
  parseOptions?: ParseOptions,
): unknown => {
  // TODO: Best to refactor to have a core parser wrapping in a list
  const parser = new EDNListParser(parseOptions);
  const [result] = parser.next('(' + edn + ')');
  // TODO: What if !parse.isDone()?
  if (result === undefined) {
    return null;
  }
  return result;
};
