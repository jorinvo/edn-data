const CONSTITUENT = /[a-zA-Z0-9.*+!_?$%&<>=-]/;

const BUILTIN_TAGS = new Set(['inst', 'uuid']);

const validatePart = (part: string, allowColonHash: boolean): void => {
  for (let i = 0; i < part.length; i++) {
    const c = part[i];
    if (i === 0 && (c === ':' || c === '#')) {
      throw new Error(`Invalid character '${c}' at start of name component`);
    }
    if (CONSTITUENT.test(c)) {
      continue;
    }
    if (allowColonHash && i > 0 && (c === ':' || c === '#')) {
      continue;
    }
    throw new Error(`Invalid character '${c}' in name`);
  }
};

export const validateSymbolName = (name: string): void => {
  if (name === '/') {
    return;
  }
  if (name.length === 0) {
    throw new Error('Symbol name cannot be empty');
  }
  const first = name[0];
  if (/[0-9]/.test(first)) {
    throw new Error(`Invalid symbol: ${name}`);
  }
  if (
    (first === '-' || first === '+' || first === '.') &&
    name.length > 1 &&
    /[0-9]/.test(name[1])
  ) {
    throw new Error(`Invalid symbol: ${name}`);
  }

  const slashes = name.split('/');
  if (slashes.length > 2) {
    throw new Error(`Invalid symbol: ${name}`);
  }
  if (slashes.length === 2) {
    const [prefix, suffix] = slashes;
    if (prefix === '' || suffix === '') {
      throw new Error(`Invalid symbol: ${name}`);
    }
    validatePart(prefix, false);
    validatePart(suffix, false);
    return;
  }
  validatePart(name, true);
};

export const validateKeywordName = (name: string): void => {
  if (name.startsWith('/') || name.startsWith(':') || name === '/') {
    throw new Error(`Invalid keyword: :${name}`);
  }
  validateSymbolName(name);
};

export const validateTagName = (name: string): void => {
  if (!/^[a-zA-Z]/.test(name)) {
    throw new Error(`Invalid tag: #${name}`);
  }
  validateSymbolName(name);
  if (!BUILTIN_TAGS.has(name) && !name.includes('/')) {
    throw new Error(
      `Invalid tag: #${name} (user tags must contain a prefix)`,
    );
  }
};
