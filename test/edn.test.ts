import { promisify } from 'util';

import * as streamToArray from 'stream-to-array';
import test from 'ava';

import {
  EDNVal,
  toEDNString,
  parseEDNString,
  parseEDNListStream,
} from '../src';

test('empty string', (t) => {
  t.is(parseEDNString('""'), '');
});
test('string', (t) => {
  t.is(parseEDNString('"hi"'), 'hi');
});
test('string with space', (t) => {
  t.is(parseEDNString('"hi there"'), 'hi there');
});
test('string multiline', (t) => {
  t.is(parseEDNString('"one\ntwo"'), 'one\ntwo');
});
test('string with newline', (t) => {
  t.is(parseEDNString('"one\\ntwo"'), 'one\ntwo');
});
test('string with Windows newline', (t) => {
  t.is(parseEDNString('"one\\rtwo"'), 'one\rtwo');
});
test('string with tab', (t) => {
  t.is(parseEDNString('"one\\ttwo"'), 'one\ttwo');
});
test('string with backslash', (t) => {
  t.is(parseEDNString('"\\\\"'), '\\');
});
test('string with quote symbol', (t) => {
  t.is(parseEDNString('"\\""'), '"');
});

test('int', (t) => {
  t.is(parseEDNString('928764'), 928764);
});
test('int with zeros', (t) => {
  t.is(parseEDNString('1001'), 1001);
});
test('zero', (t) => {
  t.is(parseEDNString('0'), 0);
});
test('plus int', (t) => {
  t.is(parseEDNString('+3'), 3);
});
test('minus zero', (t) => {
  t.is(parseEDNString('-0'), -0);
});
test('minus int', (t) => {
  t.is(parseEDNString('-12'), -12);
});

test('float', (t) => {
  t.is(parseEDNString('928.764'), 928.764);
});
test('float with zeros', (t) => {
  t.is(parseEDNString('1001.1'), 1001.1);
});
test('minus float', (t) => {
  t.is(parseEDNString('-8.74'), -8.74);
});
test('float e', (t) => {
  t.is(parseEDNString('2.1e5'), 210000);
});
test('float E', (t) => {
  t.is(parseEDNString('2.1E5'), 210000);
});
test('float e+', (t) => {
  t.is(parseEDNString('22.1e+2'), 2210);
});
test('float E+', (t) => {
  t.is(parseEDNString('22.1E+2'), 2210);
});
test('float e-', (t) => {
  t.is(parseEDNString('5.12e-3'), 0.00512);
});
test('float E-', (t) => {
  t.is(parseEDNString('5.12E-3'), 0.00512);
});
test('float e with zeros', (t) => {
  t.is(parseEDNString('1001.00100e10'), 10010010000000);
});

test('nil', (t) => {
  t.is(parseEDNString('nil'), null);
});
test('true', (t) => {
  t.is(parseEDNString('true'), true);
});
test('false', (t) => {
  t.is(parseEDNString('false'), false);
});

test('symbol with single char', (t) => {
  t.deepEqual(parseEDNString('='), { sym: '=' });
});
test('symbol with multiple chars', (t) => {
  t.deepEqual(parseEDNString('even?'), { sym: 'even?' });
});
test('symbol with space after', (t) => {
  t.deepEqual(parseEDNString('even? '), { sym: 'even?' });
});

test('keyword with single char', (t) => {
  t.deepEqual(parseEDNString(':a'), { key: 'a' });
});
test('keyword with multiple chars', (t) => {
  t.deepEqual(parseEDNString(':name'), { key: 'name' });
});
test('keyword with space after', (t) => {
  t.deepEqual(parseEDNString(':ns.nested/name '), { key: 'ns.nested/name' });
});

test('empty vector', (t) => {
  t.deepEqual(parseEDNString('[]'), []);
});
test('empty vector with space', (t) => {
  t.deepEqual(parseEDNString('[  ]'), []);
});
test('vector with single string', (t) => {
  t.deepEqual(parseEDNString('["one"]'), ['one']);
});
test('vector of strings', (t) => {
  t.deepEqual(parseEDNString('["one" "and two"]'), ['one', 'and two']);
});
test('vector of booleans', (t) => {
  t.deepEqual(parseEDNString('[true true]'), [true, true]);
});
test('vector with string and bool', (t) => {
  t.deepEqual(parseEDNString('[true "well, then."]'), [true, 'well, then.']);
});
test('vector with vectors', (t) => {
  t.deepEqual(parseEDNString('[true  ["one" ["two", nil ]]]'), [
    true,
    ['one', ['two', null]],
  ]);
});
test('vector of vectors', (t) => {
  t.deepEqual(parseEDNString('[[] [] ]'), [[], []]);
});
test('vector of vectors without spaces', (t) => {
  t.deepEqual(parseEDNString('[[][]]'), [[], []]);
});

test('empty list', (t) => {
  t.deepEqual(parseEDNString('()'), { list: [] });
});
test('empty list with space', (t) => {
  t.deepEqual(parseEDNString('(  )'), { list: [] });
});
test('list with single string', (t) => {
  t.deepEqual(parseEDNString('("one")'), { list: ['one'] });
});
test('list of strings', (t) => {
  t.deepEqual(parseEDNString('("one" "and two")'), {
    list: ['one', 'and two'],
  });
});
test('list of booleans', (t) => {
  t.deepEqual(parseEDNString('(true true)'), { list: [true, true] });
});
test('list with string and bool', (t) => {
  t.deepEqual(parseEDNString('(true "well, then.")'), {
    list: [true, 'well, then.'],
  });
});
test('list of lists', (t) => {
  t.deepEqual(parseEDNString('(true  ("one" ("two", nil )))'), {
    list: [true, { list: ['one', { list: ['two', null] }] }],
  });
});

test('list as array', (t) => {
  t.deepEqual(
    parseEDNString('(true  ("one" ("two", nil )))', { listAs: 'array' }),
    [true, ['one', ['two', null]]],
  );
});

test('empty set', (t) => {
  t.deepEqual(parseEDNString('#{}'), { set: [] });
});
test('empty set with space', (t) => {
  t.deepEqual(parseEDNString('#{  }'), { set: [] });
});
test('set with single string', (t) => {
  t.deepEqual(parseEDNString('#{"one"}'), { set: ['one'] });
});
test('set of strings', (t) => {
  t.deepEqual(parseEDNString('#{"one" "and two"}'), {
    set: ['one', 'and two'],
  });
});
test('set of booleans', (t) => {
  t.deepEqual(parseEDNString('#{true true}'), { set: [true, true] });
});
test('set with string and bool', (t) => {
  t.deepEqual(parseEDNString('#{true "well, then."}'), {
    set: [true, 'well, then.'],
  });
});
test('set of sets', (t) => {
  t.deepEqual(parseEDNString('#{true  #{"one" #{"two", nil }}}'), {
    set: [true, { set: ['one', { set: ['two', null] }] }],
  });
});
test('set as array', (t) => {
  t.deepEqual(
    parseEDNString('#{true  #{"one" #{"two", nil }}}', { setAs: 'array' }),
    [true, ['one', ['two', null]]],
  );
});
test('set as set', (t) => {
  t.deepEqual(
    parseEDNString('#{true  #{"one" #{"two", nil }}}', { setAs: 'set' }),
    new Set([true, new Set(['one', new Set(['two', null])])]),
  );
});

test('empty map', (t) => {
  t.deepEqual(parseEDNString('{}'), { map: [] });
});
test('empty map with space', (t) => {
  t.deepEqual(parseEDNString('{  }'), { map: [] });
});
test('map with single string', (t) => {
  t.deepEqual(parseEDNString('{"one" "two"}'), { map: [['one', 'two']] });
});
test('map of two', (t) => {
  t.deepEqual(parseEDNString('{"a" true, "b" false }'), {
    map: [
      ['a', true],
      ['b', false],
    ],
  });
});
test('map of maps', (t) => {
  t.deepEqual(parseEDNString('{true  {"one" {"two", nil }}}'), {
    map: [[true, { map: [['one', { map: [['two', null]] }]] }]],
  });
});
test('map as object', (t) => {
  t.deepEqual(parseEDNString('{"a"  {"b" {"c", 123}}}', { mapAs: 'object' }), {
    a: { b: { c: 123 } },
  });
});
test('map as map', (t) => {
  t.deepEqual(
    parseEDNString('{"a"  {"b" {"c", 123}}}', { mapAs: 'map' }),
    new Map([['a', new Map([['b', new Map([['c', 123]])]])]]),
  );
});

test('tagged key', (t) => {
  t.deepEqual(parseEDNString('#ns.a/tag :key'), {
    tag: 'ns.a/tag',
    val: { key: 'key' },
  });
});
test('tagged int', (t) => {
  t.deepEqual(parseEDNString('#my/tag 555'), { tag: 'my/tag', val: 555 });
});

test('#inst as Date', (t) => {
  t.deepEqual(
    parseEDNString('#inst "2020-04-12T21:39:15.482Z"'),
    new Date('2020-04-12T21:39:15.482Z'),
  );
});

test('crux tx response', (t) => {
  t.deepEqual(
    parseEDNString(
      '{:crux.tx/tx-id 2, :crux.tx/tx-time #inst "2020-04-13T08:01:14.261-00:00"}',
    ),
    {
      map: [
        [{ key: 'crux.tx/tx-id' }, 2 as EDNVal],
        [
          { key: 'crux.tx/tx-time' },
          new Date('2020-04-13T08:01:14.261-00:00') as EDNVal,
        ],
      ],
    },
  );
});
test('crux tx response as object', (t) => {
  t.deepEqual(
    parseEDNString(
      '{:crux.tx/tx-id 2, :crux.tx/tx-time #inst "2020-04-13T08:01:14.261-00:00"}',
      { mapAs: 'object', keywordAs: 'string' },
    ),
    {
      'crux.tx/tx-id': 2,
      'crux.tx/tx-time': new Date('2020-04-13T08:01:14.261-00:00'),
    },
  );
});

test('stream', (t) => {
  const s = parseEDNListStream({ mapAs: 'object', keywordAs: 'string' });
  s.write(' ({:hello "world"} "how are you"');
  s.write('"my');
  s.write(' friend" :end false)');
  t.deepEqual(s.read(), { hello: 'world' });
  t.deepEqual(s.read(), 'how are you');
  t.deepEqual(s.read(), 'my friend');
  t.deepEqual(s.read(), 'end');
  t.deepEqual(s.read(), false);
});

test('stream-to-array', async (t) => {
  const s = parseEDNListStream({ mapAs: 'object', keywordAs: 'string' });
  s.write(' ({:hello "world"} "how are you"');
  s.write('"my');
  s.write(' friend" :end false)');
  t.deepEqual(await promisify(streamToArray)(s), [
    { hello: 'world' },
    'how are you',
    'my friend',
    'end',
    false,
  ]);
});
