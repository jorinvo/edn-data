// TODO: Allow to specify handler functions for tags. Date is one implementation of that
// TODO: Allow to drop tags, a special case of a generic handler function
// TODO: Support browser (non-streaming)
// TODO: the return type can depend on the options
// TODO: Error when wrong closing tag
// TODO: test edn generation
// TODO: keywords must contain a single slash
// TODO: Can you tag a tagged val?
// TODO: keywords and symbols need some care with characters
// TODO: tag if not one of the well known must contain exactly one slash
// TODO: support unicode chars
// TODO: support bigint
// TODO: support parsing nested #_ discard, does it work in Clojure? Is it mentioned in the spec?

export { EDNVal } from './types';
export { parseEDNString, parseEDNListStream } from './parse';
export { toEDNString, tagValue, toKeyword, toSymbol } from './generate';
