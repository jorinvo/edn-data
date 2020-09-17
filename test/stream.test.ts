import { promisify } from 'util';

import * as streamToArray from 'stream-to-array';
import test from 'ava';

import { parseEDNListStream } from '../src/stream';

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

test('readme example', (t) => {
  const s = parseEDNListStream();
  s.write('(1 2 3)');
  t.deepEqual(s.read(), 1);
  t.deepEqual(s.read(), 2);
  t.deepEqual(s.read(), 3);
});
