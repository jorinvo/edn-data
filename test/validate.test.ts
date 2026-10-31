import test from 'ava';

import { tagValue, toEDNString, toKeyword, toSymbol } from '../src';

test('toSymbol accepts valid symbols', (t) => {
  t.deepEqual(toSymbol('foo'), { sym: 'foo' });
  t.deepEqual(toSymbol('my-ns/foo'), { sym: 'my-ns/foo' });
  t.deepEqual(toSymbol('/'), { sym: '/' });
  t.deepEqual(toSymbol('+x'), { sym: '+x' });
});

test('toSymbol rejects invalid symbols', (t) => {
  t.throws(() => toSymbol('1foo'), { message: /Invalid symbol/ });
  t.throws(() => toSymbol('foo/bar/baz'), { message: /Invalid symbol/ });
  t.throws(() => toSymbol('/foo'), { message: /Invalid symbol/ });
  t.throws(() => toSymbol('foo/'), { message: /Invalid symbol/ });
  t.throws(() => toSymbol('.1'), { message: /Invalid symbol/ });
  t.throws(() => toSymbol('foo bar'), { message: /Invalid character/ });
});

test('toKeyword accepts valid keywords', (t) => {
  t.deepEqual(toKeyword('fred'), { key: 'fred' });
  t.deepEqual(toKeyword('my/fred'), { key: 'my/fred' });
});

test('toKeyword rejects invalid keywords', (t) => {
  t.throws(() => toKeyword('/'), { message: /Invalid keyword/ });
  t.throws(() => toKeyword('/foo'), { message: /Invalid keyword/ });
  t.throws(() => toKeyword(':foo'), { message: /Invalid keyword/ });
});

test('tagValue accepts built-in and prefixed tags', (t) => {
  t.deepEqual(tagValue('inst', '2020-01-01'), {
    tag: 'inst',
    val: '2020-01-01',
  });
  t.deepEqual(tagValue('myapp/Person', { key: 'name' }), {
    tag: 'myapp/Person',
    val: { key: 'name' },
  });
});

test('tagValue rejects invalid tags', (t) => {
  t.throws(() => tagValue('Person', 1), {
    message: /user tags must contain a prefix/,
  });
  t.throws(() => tagValue('_', 1), { message: /Invalid tag/ });
});

test('toEDNString validates embedded names', (t) => {
  t.throws(
    () => toEDNString({ key: '/bad' }),
    { message: /Invalid keyword/ },
  );
});
