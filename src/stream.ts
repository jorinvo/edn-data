import * as stream from 'stream';

import { EDNListParser, ParseOptions } from './parse';

export class ParseEDNListSteam extends stream.Transform {
  parser: EDNListParser;

  constructor(options?: ParseOptions) {
    super({ readableObjectMode: true });
    this.parser = new EDNListParser(options);
  }

  _transform(chunk, encoding, callback): void {
    // TODO encoding
    const values = this.parser.next(chunk.toString());
    for (const val of values) {
      this.push(val);
    }
    if (this.parser.isDone()) {
      this.push(null);
    }
    callback();
  }
}

export const parseEDNListStream = (
  parseOptions?: ParseOptions,
): ParseEDNListSteam => {
  return new ParseEDNListSteam(parseOptions);
};
