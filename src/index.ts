// TODO: Error when wrong closing tag
// TODO: test edn generation
// TODO: run tests in github action
// TODO: keywords must contain a single slash
// TODO: Can you tag a tagged val?
// TODO: keywords and symbols need some care with characters
// TODO: tag if not one of the well known must contain exactly one slash
// TODO: support unicode chars
// TODO: support bigint
// TODO: support parsing nested #_ discard, does it work in Clojure? Is it mentioned in the spec?
// TODO: Production build
// TODO: Instruction how to use in browser
// TODO: The return type can depend on the options, also on the tagHandlers types
// TODO: Refactor parser to work for single element and not only lists

export { EDNVal } from './types';
export { parseEDNString } from './parse';
export { toEDNString, tagValue, toKeyword, toSymbol } from './generate';
