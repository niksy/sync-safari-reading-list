var assert = require('assert');
var url = require('url');
var readList = require('read-safari-reading-list');
var nock = require('nock');
var rewire = require('rewire');
var proxyquire = require('proxyquire');
var fn = require('../');

var links = './test/fixtures/links.plist';
var apiToken = 'token';
var pinboard;

function beforeNetworkMock ( opts ) {

	pinboard = rewire('node-pinboard');

	return function () {
		return readList(opts.links)
			.then(function ( data ) {
				return data.map(function ( item ) {
					var parsedUrl = url.parse(item.url);
					var pathname = parsedUrl.pathname;
					delete parsedUrl.pathname;
					return [
						nock(url.format(parsedUrl))
							.head(pathname)
							.reply(200),
						nock(pinboard.__get__('API_URL'))
							.get('/posts/add')
							.query(true)
							.reply(200, (opts.invalidApiToken ? undefined : { // eslint-disable-line no-undefined
								'result_code': (opts.success ? 'done' : 'something went wrong')
							}))
					];

				});
			});
	};
}

function afterNetworkMock () {
	pinboard();
}

describe('Invalid options', function () {

	it('should throw if Pinboard API token is not provided', function () {
		return fn(links)
			.catch(function ( err ) {
				assert.equal(typeof err, 'string');
			});
	});

});

describe('Send links from default Safari Reading List', function () {

	before(beforeNetworkMock({
		links: links,
		success: true
	}));
	after(afterNetworkMock);

	it('should sync Safari Reading List links with Pinboard', function () {

		var pfn = proxyquire('../', {
			'read-safari-reading-list': function () {
				return readList(links);
			}
		});

		return pfn({
			apiToken: apiToken
		})
			.then(function ( res ) {
				assert.equal(res.length, 3);
				assert.deepEqual(res, [
					{
						'result_code': 'done'
					},
					{
						'result_code': 'done'
					},
					{
						'result_code': 'done'
					}
				]);
			});

	});

});

describe('Send links from defined Safari Reading List', function () {

	before(beforeNetworkMock({
		links: links,
		success: true
	}));
	after(afterNetworkMock);

	it('should sync Safari Reading List links with Pinboard', function () {

		return fn(links, {
			apiToken: apiToken
		})
			.then(function ( res ) {
				assert.equal(res.length, 3);
				assert.deepEqual(res, [
					{
						'result_code': 'done'
					},
					{
						'result_code': 'done'
					},
					{
						'result_code': 'done'
					}
				]);
			});

	});

});

describe('Clear Safari Reading List', function () {

	before(beforeNetworkMock({
		links: links,
		success: true
	}));
	after(afterNetworkMock);

	it('should clear Safari Reading List links when it’s finished with syncing to Pinboard', function () {

		var pfn = proxyquire('../', {
			'write-safari-reading-list': function () {
				return Promise.resolve();
			}
		});

		return pfn(links, {
			apiToken: apiToken,
			clearList: true
		})
			.then(function ( res ) {
				assert.equal(res.length, 3);
			});

	});

});

describe('Don’t clean URLs', function () {

	before(beforeNetworkMock({
		links: links,
		success: true
	}));
	after(afterNetworkMock);

	it('shouldn’t clean URLs before syncing Safari Reading List links with Pinboard', function () {

		return fn(links, {
			apiToken: apiToken,
			cleanUrls: false
		})
			.then(function ( res ) {
				assert.equal(res.length, 3);
				assert.deepEqual(res, [
					{
						'result_code': 'done'
					},
					{
						'result_code': 'done'
					},
					{
						'result_code': 'done'
					}
				]);
			});

	});

});

describe('Error while contacting Pinboard', function () {

	describe('Generic', function () {

		before(beforeNetworkMock({
			links: links,
			success: false
		}));
		after(afterNetworkMock);

		it('should reject if syncing with Pinboard wasn’t successful', function () {

			var pfn = proxyquire('../', {
				'read-safari-reading-list': function () {
					return readList(links);
				}
			});

			return pfn({
				apiToken: apiToken
			})
				.catch(function ( err ) {
					assert.equal(err, 'Error while syncing with Pinboard: something went wrong');
				});

		});

	});

	describe('Invalid API token', function () {

		before(beforeNetworkMock({
			links: links,
			invalidApiToken: true
		}));
		after(afterNetworkMock);

		it('should reject if Pinboard API token is invalid', function () {

			var pfn = proxyquire('../', {
				'read-safari-reading-list': function () {
					return readList(links);
				}
			});

			return pfn({
				apiToken: apiToken
			})
				.catch(function ( err ) {
					assert.equal(err, 'Unknown error occured while syncing with Pinboard.');
				});

		});

	});

});
