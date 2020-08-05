import test from 'ava';

import { EDNVal, parseEDNString } from '../src';

test('empty document as null', (t) => {
  t.is(parseEDNString(''), null);
  t.is(parseEDNString('; just some comment'), null);
});

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
test('string after symbol without space', (t) => {
  t.deepEqual(parseEDNString('[hi"hi"]'), [{ sym: 'hi' }, 'hi']);
});
test('string before symbol without space', (t) => {
  t.deepEqual(parseEDNString('["hi"hi]'), ['hi', { sym: 'hi' }]);
});
test('string after bool without space', (t) => {
  t.deepEqual(parseEDNString('[true"hi"]'), [true, 'hi']);
});
test('string before bool without space', (t) => {
  t.deepEqual(parseEDNString('["hi"true]'), ['hi', true]);
});
test('string after int without space', (t) => {
  t.deepEqual(parseEDNString('[123"hi"]'), [123, 'hi']);
});
test('string before int without space', (t) => {
  t.deepEqual(parseEDNString('["hi"123]'), ['hi', 123]);
});
test('string after string without space', (t) => {
  t.deepEqual(parseEDNString('["hi""hi"]'), ['hi', 'hi']);
});
test('string before string without space', (t) => {
  t.deepEqual(parseEDNString('["hi""hi"]'), ['hi', 'hi']);
});

test('char', (t) => {
  t.deepEqual(parseEDNString('\\a'), { char: 'a' });
});
test('char space', (t) => {
  t.deepEqual(parseEDNString('\\space'), { char: ' ' });
});
test('char newline', (t) => {
  t.deepEqual(parseEDNString('\\newline'), { char: '\n' });
});
test('char return', (t) => {
  t.deepEqual(parseEDNString('\\return'), { char: '\r' });
});
test('char tab', (t) => {
  t.deepEqual(parseEDNString('\\tab'), { char: '	' });
});
test('char backslash', (t) => {
  t.deepEqual(parseEDNString('\\\\'), { char: '\\' });
});
test('char as string', (t) => {
  t.deepEqual(parseEDNString('\\abc', { charAs: 'string' }), 'abc');
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
test('vector after symbol without space', (t) => {
  t.deepEqual(parseEDNString('[hi[]]'), [{ sym: 'hi' }, []]);
});
test('vector before symbol without space', (t) => {
  t.deepEqual(parseEDNString('[[]hi]'), [[], { sym: 'hi' }]);
});
test('vector after bool without space', (t) => {
  t.deepEqual(parseEDNString('[true[]]'), [true, []]);
});
test('vector before bool without space', (t) => {
  t.deepEqual(parseEDNString('[[]true]'), [[], true]);
});
test('vector after string without space', (t) => {
  t.deepEqual(parseEDNString('["hi"[]]'), ['hi', []]);
});
test('vector before string without space', (t) => {
  t.deepEqual(parseEDNString('[[]"hi"]'), [[], 'hi']);
});
test('vector after vector without space', (t) => {
  t.deepEqual(parseEDNString('[[][]]'), [[], []]);
});
test('vector before vector without space', (t) => {
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
test('list after symbol without space', (t) => {
  t.deepEqual(parseEDNString('(hi())'), {
    list: [{ sym: 'hi' }, { list: [] }],
  });
});
test('list before symbol without space', (t) => {
  t.deepEqual(parseEDNString('(()hi)'), {
    list: [{ list: [] }, { sym: 'hi' }],
  });
});
test('list after bool without space', (t) => {
  t.deepEqual(parseEDNString('(false())'), {
    list: [false, { list: [] }],
  });
});
test('list before bool without space', (t) => {
  t.deepEqual(parseEDNString('(()false)'), {
    list: [{ list: [] }, false],
  });
});
test('list after string without space', (t) => {
  t.deepEqual(parseEDNString('("hi"())'), {
    list: ['hi', { list: [] }],
  });
});
test('list before string without space', (t) => {
  t.deepEqual(parseEDNString('(()"hi")'), {
    list: [{ list: [] }, 'hi'],
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
test('set after symbol without space', (t) => {
  t.deepEqual(parseEDNString('#{hi#{}}'), {
    set: [{ sym: 'hi' }, { set: [] }],
  });
});
test('set before symbol without space', (t) => {
  t.deepEqual(parseEDNString('#{#{}hi}'), {
    set: [{ set: [] }, { sym: 'hi' }],
  });
});
test('set after bool without space', (t) => {
  t.deepEqual(parseEDNString('#{true#{}}'), {
    set: [true, { set: [] }],
  });
});
test('set before bool without space', (t) => {
  t.deepEqual(parseEDNString('#{#{}true}'), {
    set: [{ set: [] }, true],
  });
});
test('set after string without space', (t) => {
  t.deepEqual(parseEDNString('#{"hi"#{}}'), {
    set: ['hi', { set: [] }],
  });
});
test('set before string without space', (t) => {
  t.deepEqual(parseEDNString('#{#{}"hi"}'), {
    set: [{ set: [] }, 'hi'],
  });
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
test('map after symbol without space', (t) => {
  t.deepEqual(parseEDNString('{hi{}}'), {
    map: [[{ sym: 'hi' }, { map: [] }]],
  });
});
test('map before symbol without space', (t) => {
  t.deepEqual(parseEDNString('{{}hi}'), {
    map: [[{ map: [] }, { sym: 'hi' }]],
  });
});
test('map after bool without space', (t) => {
  t.deepEqual(parseEDNString('{false{}}'), {
    map: [[false, { map: [] }]],
  });
});
test('map before bool without space', (t) => {
  t.deepEqual(parseEDNString('{{}false}'), {
    map: [[{ map: [] }, false]],
  });
});
test('map after string without space', (t) => {
  t.deepEqual(parseEDNString('{"hi"{}}'), {
    map: [['hi', { map: [] }]],
  });
});
test('map before string without space', (t) => {
  t.deepEqual(parseEDNString('{{}"hi"}'), {
    map: [[{ map: [] }, 'hi']],
  });
});

test('comment', (t) => {
  t.is(parseEDNString('; "hi"'), null);
});
test('ignore comments', (t) => {
  t.is(
    parseEDNString(`
      ; look at this EDN
      "EDN"
      ;; nice, isn't it?
    `),
    'EDN',
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
test('tag tagged value', (t) => {
  t.deepEqual(parseEDNString('#ns.a/tag2 #ns.a/tag1 :key'), {
    tag: 'ns.a/tag2',
    val: {
      tag: 'ns.a/tag1',
      val: { key: 'key' },
    },
  });
});
test('tag tagged value, nested', (t) => {
  t.deepEqual(parseEDNString('(:a [#ns.a/tag2 #ns.a/tag1 :key "hi"] 1)'), {
    list: [
      { key: 'a' },
      [
        {
          tag: 'ns.a/tag2',
          val: {
            tag: 'ns.a/tag1',
            val: { key: 'key' },
          },
        },
        'hi',
      ],
      1,
    ],
  });
});
test('custom tag handler', (t) => {
  t.deepEqual(
    parseEDNString('#my/tag 5', {
      tagHandlers: {
        'my/tag': (val) => {
          if (typeof val !== 'number') {
            throw new Error('not a number');
          }
          return val * 2;
        },
      },
    }),
    10,
  );
});

test('#inst as Date', (t) => {
  t.deepEqual(
    parseEDNString('#inst "2020-04-12T21:39:15.482Z"'),
    new Date('2020-04-12T21:39:15.482Z'),
  );
});

test('discard string', (t) => {
  t.is(parseEDNString('#_"hi"'), null);
  t.is(parseEDNString('#_  "hi"'), null);
});
test('discard int', (t) => {
  t.is(parseEDNString('#_928764'), null);
  t.is(parseEDNString('#_  928764'), null);
});
test('discard symbol', (t) => {
  t.deepEqual(parseEDNString('#_even? '), null);
  t.deepEqual(parseEDNString('#_  even? '), null);
});
test('discard keyword', (t) => {
  t.deepEqual(parseEDNString('#_:a'), null);
  t.deepEqual(parseEDNString('#_  :a'), null);
});
test('discard vector', (t) => {
  t.deepEqual(parseEDNString('#_[]'), null);
  t.deepEqual(parseEDNString('#_  []'), null);
});
test('discard list', (t) => {
  t.deepEqual(parseEDNString('#_()'), null);
  t.deepEqual(parseEDNString('#_  ()'), null);
});
test('discard set', (t) => {
  t.deepEqual(parseEDNString('#_#{}'), null);
  t.deepEqual(parseEDNString('#_  #{}'), null);
});
test('discard map', (t) => {
  t.deepEqual(parseEDNString('#_{}'), null);
  t.deepEqual(parseEDNString('#_  {}'), null);
});
test('discard vector element', (t) => {
  t.deepEqual(parseEDNString('[1 #_2 3]'), [1, 3]);
  t.deepEqual(parseEDNString('[1 #_  2 3]'), [1, 3]);
});
test('discard list element', (t) => {
  t.deepEqual(parseEDNString('(1 #_2 3)'), { list: [1, 3] });
  t.deepEqual(parseEDNString('(1 #_  2 3)'), { list: [1, 3] });
});
test('discard set element', (t) => {
  t.deepEqual(parseEDNString('#{1 #_2 3}'), { set: [1, 3] });
  t.deepEqual(parseEDNString('#{1 #_  2 3}'), { set: [1, 3] });
});
test('discard map middle element', (t) => {
  t.deepEqual(parseEDNString('{1 #_2 3}'), { map: [[1, 3]] });
  t.deepEqual(parseEDNString('{1 #_  2 3}'), { map: [[1, 3]] });
});
test('discard map last element', (t) => {
  t.deepEqual(parseEDNString('{1 2 #_3}'), { map: [[1, 2]] });
  t.deepEqual(parseEDNString('{1 2 #_  3}'), { map: [[1, 2]] });
});
test('discard tag', (t) => {
  t.deepEqual(parseEDNString('#_  #ns.a/tag :key'), null);
  t.deepEqual(parseEDNString('#_#ns.a/tag :key'), null);
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
