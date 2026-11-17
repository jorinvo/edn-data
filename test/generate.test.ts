import test from 'ava';

import { toEDNString, toEDNStringFromSimpleObject } from '../src';

test('toEDNString crux', (t) => {
  t.is(
    toEDNString({
      map: [
        [{ key: 'crux.tx/tx-id' }, 2],
        [{ key: 'crux.tx/tx-time' }, new Date('2020-04-13T08:01:14.261-00:00')],
      ],
    }),
    '{:crux.tx/tx-id 2 :crux.tx/tx-time #inst "2020-04-13T08:01:14.261Z"}',
  );
});

test('toEDNString readme sample', (t) => {
  t.is(
    toEDNString({
      map: [
        [1, { key: 'keyword' }],
        [{ set: [1, 2] }, { char: 'a' }],
      ],
    }),
    '{1 :keyword #{1 2} \\a}',
  );
});

test('toEDNString named whitespace chars', (t) => {
  t.is(toEDNString({ char: ' ' }), '\\space');
  t.is(toEDNString({ char: '\n' }), '\\newline');
  t.is(toEDNString({ char: '\t' }), '\\tab');
  t.is(toEDNString({ char: '\r' }), '\\return');
  t.is(toEDNString({ char: 'constructor' }), '\\constructor');
});

test('non-finite numbers throw', (t) => {
  for (const n of [Infinity, -Infinity, NaN]) {
    t.throws(() => toEDNString(n));
    t.throws(() => toEDNStringFromSimpleObject({ n }));
  }
});

test('toEDNStringFromSimpleObject crux keysAs keyword', (t) => {
  t.is(
    toEDNStringFromSimpleObject({
      'crux.tx/tx-id': 2,
      'crux.tx/tx-time': new Date('2020-04-13T08:01:14.261-00:00'),
    }),
    '{:crux.tx/tx-id 2 :crux.tx/tx-time #inst "2020-04-13T08:01:14.261Z"}',
  );
});

test('toEDNStringFromSimpleObject crux keysAs string', (t) => {
  t.is(
    toEDNStringFromSimpleObject(
      {
        'crux.tx/tx-id': 2,
        'crux.tx/tx-time': new Date('2020-04-13T08:01:14.261-00:00'),
      },
      { keysAs: 'string' },
    ),
    '{"crux.tx/tx-id" 2 "crux.tx/tx-time" #inst "2020-04-13T08:01:14.261Z"}',
  );
});

test('toEDNStringFromSimpleObject readme sample', (t) => {
  t.is(
    toEDNStringFromSimpleObject({ first: 1, second: 2 }),
    '{:first 1 :second 2}',
  );
});
