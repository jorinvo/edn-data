import test from 'ava';

import { toEDNString, toEDNStringFromSimpleObject } from '../src';

test('toEDNString', (t) => {
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

test('toEDNStringFromSimpleObject keysAs keyword', (t) => {
  t.is(
    toEDNStringFromSimpleObject({
      'crux.tx/tx-id': 2,
      'crux.tx/tx-time': new Date('2020-04-13T08:01:14.261-00:00'),
    }),
    '{:crux.tx/tx-id 2 :crux.tx/tx-time #inst "2020-04-13T08:01:14.261Z"}',
  );
});

test('toEDNStringFromSimpleObject keysAs string', (t) => {
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
