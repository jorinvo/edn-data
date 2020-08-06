// TODO: run tests in github action
// TODO: Production build
// TODO: Instruction how to use in browser
// TODO: Release it
// TODO: keywords and symbols need some care with allowed characters
// TODO: support unicode chars
// TODO: support bigint
// TODO: test edn generation
// TODO: The return type can depend on the options, also on the tagHandlers types
// TODO: Refactor parser to work for single element and not only lists
// TODO: keywords must contain a single slash
// TODO: tag if not one of the well known must contain exactly one slash
// TODO: Error when wrong closing tag

export { EDNVal } from './types';
export { parseEDNString } from './parse';
export { toEDNString, tagValue, toKeyword, toSymbol } from './generate';
