# sync-safari-reading-list

[![Build Status][ci-img]][ci]

Sync Safari Reading List to [Pinboard][pinboard] bookmarking service.

## Install

```sh
npm install sync-safari-reading-list --save
```

## Usage

```js
var syncList = require('sync-safari-reading-list');

syncList({
	apiToken: PINBOARD_API_TOKEN
})
	.then(function ( responses ) {
		console.log(responses);
		// => [{ result_code: 'done' }, …]
	});
```

## API

### syncList(filePath, opts)

Returns: `Promise`

Sync Safari Reading List to Pinboard. If file path to Safari Reading List is not provided, it uses default argument from [read-safari-reading-list](https://github.com/niksy/read-safari-reading-list#readlistfilepath)

#### filePath

Type: `String`

Path to property list.

#### opts

Type: `Object`

##### apiToken

Type: `String`  
**Required**

Pinboard API token.

##### cleanUrls

Type: `Boolean`  
Default: `true`

Cleans URLs from:

* mobile subdomains
* UTM query parameters

##### clearList

Type: `Boolean`  
Default: `false`

Should Safari Reading List be cleaned on successful syncing.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

[ci]: https://travis-ci.org/niksy/sync-safari-reading-list
[ci-img]: https://img.shields.io/travis/niksy/sync-safari-reading-list.svg
[pinboard]: https://pinboard.in/
