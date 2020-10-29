# edn-data

`edn-data` is a JavaScript and TypeScript library that provides functionality to generate and parse data in the [EDN format](https://github.com/edn-format/edn), as known from [Clojure](https://clojure.org/) land.


## Why create another library for working with EDN?

- Support TypeScript with a strictly typed interface
- Support the rich EDN types
- Allow working with plain data in JavaScript, so everything can also be serialized to JSON
- Support modern JavaScript types such as `Map`, `Set` and `bigint`
- Support streaming EDN lists as standard [Node stream](https://nodejs.org/api/stream.html) in Node.js
- Have a solution that works in Node.js and in browsers


## Why work with EDN in JavaScript or TypeScript?

The number one reason is, your code wants to interact with data coming from Clojure.

But even outside Clojure EDN can be a compelling data format in a world where developers are stuck [fighting YAML](https://twitter.com/jorinvo/status/1283859530695290886)
and [complaining about JSON](https://twitter.com/jorinvo/status/1303095726189228032).

EDN has:

- less syntax than JSON
- built-in data types to represent maps, sets, keywords, dates, uuids, chars, bigints, ...
- multi-line strings
- tags and symbols to represent rich, custom data types
- comments
- streaming parsers
- no relevant whitespace


## Get started

Install with:

```
npm install edn-data
```

### Parsing EDN

By default parsing returns JSON-compatible data structures that can represent all of the rich EDN types.

There are options to make it easier to parse simpler types.

```js
import { parseEDNString } from 'edn-data'

parseEDNString('{:key "value" :list [1 2 3]}')
// Returns:
{
  map: [
    [{ key: 'key' }, 'value'],
    [{ key: 'list' }, [1, 2, 3]],
  ],
}

parseEDNString(
  '{:key "value" :list [1 2 3]}',
  { mapAs: 'object', keywordAs: 'string' },
)
// Returns:
{
  key: 'value',
  list: [1, 2, 3],
}
```

EDN lists can be streamed value by value as standard Node.js Readable streams.
This is not available in the browser.

```js
import { parseEDNListStream } from 'edn-data/stream'

const s = parseEDNListStream()
s.write('(1 2 3)')
s.read() // 1
s.read() // 2
s.read() // 3
```


### Generating EDN

EDN is generated from plain JSON structures.

With `toEDNString` the same data structures `parseEDNString` returns can be turned to valid strings, and they represent a rich set of types.

For simple JavaScript types often `toEDNStringFromSimpleObject` might be the simpler use.

```js
import { toEDNString, toEDNStringFromSimpleObject } from 'edn-data';

toEDNString({
  map: [
    [1, { key: 'keyword' }],
    [{ set: [1, 2] }, { char: 'a' }],
  ],
})
// Returns:
'{1 :keyword #{1 2} \a}'

toEDNStringFromSimpleObject({ first: 1, second: 2 })
// Returns:
'{:first 1 :second 2}'
```


## Development

The library is developed driven by its tests.

Verify them using

```
npm test
```

For continuous development use

```
npm run test:watch
```

Ensure the code formatting with

```
npm run fix
```

CI verifies tests and creates npm releases for tags automatically.


### Publish a new version

1. Change the `version` in the `package.json`
2. Push a commit to master in the following form `Release <version>`
3. A Git tag will be created and the new version will be published to NPM


## License

[MIT](./license)
