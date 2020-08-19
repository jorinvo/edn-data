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

export type EDNObjectableVal =
  | string
  | number
  | boolean
  | null
  | bigint
  | Date
  | Map<EDNObjectableVal, EDNObjectableVal>
  | Set<EDNObjectableVal>
  | EDNObjectableVal[]
  | { [key: string]: EDNObjectableVal };
