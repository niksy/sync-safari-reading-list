'use strict';

const assert = require('assert');
const url = require('url');
const readList = require('read-safari-reading-list');
const nock = require('nock');
const rewire = require('rewire');
const proxyquire = require('proxyquire');
const fn = require('../');

const links = './test/fixtures/links.plist';
const apiToken = 'token';

function prepareMock ( opts ) {
	const pinboard = rewire('node-pinboard');
	return {
		before: () => {
			return readList(opts.links)
				.then(( data ) => {
					return data.map(( item ) => {
						const parsedUrl = url.parse(item.url, true);
						return [
							nock(`${parsedUrl.protocol}//${parsedUrl.hostname}`)
								.head(parsedUrl.pathname)
								.query(parsedUrl.query)
								.reply(opts.errorStatusCode ? 409 : 200),
							nock(pinboard.__get__('API_URL'))
								.get('/posts/add')
								.query(true)
								.reply(200, (opts.invalidApiToken ? undefined : { // eslint-disable-line no-undefined
									'result_code': (opts.success ? 'done' : 'something went wrong')
								}))
						];

					});
				});
		},
		after: () => {
			nock.cleanAll();
			pinboard();
		}
	};
}

describe('Invalid options', function () {

	it('should throw if Pinboard API token is not provided', function () {
		return fn(links)
			.catch(( err ) => {
				assert.equal(typeof err, 'string');
			});
	});

});

describe('Send links from default Safari Reading List', function () {

	const mock = prepareMock({
		links: links,
		success: true
	});
	before(mock.before);
	after(mock.after);

	it('should sync Safari Reading List links with Pinboard', function () {

		const pfn = proxyquire('../', {
			'read-safari-reading-list': () => {
				return readList(links);
			}
		});

		return pfn({
			apiToken: apiToken
		})
			.then(( res ) => {
				assert.equal(res.length, 3);
				assert.deepEqual(res, [
					{
						url: 'http://example.com/katie',
						pinboardResponse: {
							'result_code': 'done'
						}
					},
					{
						url: 'http://example.com/lacey',
						pinboardResponse: {
							'result_code': 'done'
						}
					},
					{
						url: 'http://example.com/@callie',
						pinboardResponse: {
							'result_code': 'done'
						}
					}
				]);
			});

	});

});

describe('Send links from defined Safari Reading List', function () {

	const mock = prepareMock({
		links: links,
		success: true
	});
	before(mock.before);
	after(mock.after);

	it('should sync Safari Reading List links with Pinboard', function () {

		return fn(links, {
			apiToken: apiToken
		})
			.then(( res ) => {
				assert.equal(res.length, 3);
				assert.deepEqual(res, [
					{
						url: 'http://example.com/katie',
						pinboardResponse: {
							'result_code': 'done'
						}
					},
					{
						url: 'http://example.com/lacey',
						pinboardResponse: {
							'result_code': 'done'
						}
					},
					{
						url: 'http://example.com/@callie',
						pinboardResponse: {
							'result_code': 'done'
						}
					}
				]);
			});

	});

});

describe('Clear Safari Reading List', function () {

	const mock = prepareMock({
		links: links,
		success: true
	});
	before(mock.before);
	after(mock.after);

	it('should clear Safari Reading List links when it’s finished with syncing to Pinboard', function () {

		const pfn = proxyquire('../', {
			'write-safari-reading-list': () => {
				return Promise.resolve();
			}
		});

		return pfn(links, {
			apiToken: apiToken,
			clearList: true
		})
			.then(( res ) => {
				assert.equal(res.length, 3);
			});

	});

});

describe('Don’t clean URLs', function () {

	const mock = prepareMock({
		links: links,
		success: true
	});
	before(mock.before);
	after(mock.after);

	it('shouldn’t clean URLs before syncing Safari Reading List links with Pinboard', function () {

		return fn(links, {
			apiToken: apiToken,
			cleanUrls: false
		})
			.then(( res ) => {
				assert.equal(res.length, 3);
				assert.deepEqual(res, [
					{
						url: 'http://mobile.example.com/katie',
						pinboardResponse: {
							'result_code': 'done'
						}
					},
					{
						url: 'http://example.com/lacey?utm_medium=lily',
						pinboardResponse: {
							'result_code': 'done'
						}
					},
					{
						url: 'http://example.com/@callie',
						pinboardResponse: {
							'result_code': 'done'
						}
					}
				]);
			});

	});

});

describe('Error while contacting Pinboard', function () {

	describe('Generic', function () {

		const mock = prepareMock({
			links: links,
			success: false
		});
		before(mock.before);
		after(mock.after);

		it('should reject if syncing with Pinboard wasn’t successful', function () {

			const pfn = proxyquire('../', {
				'read-safari-reading-list': () => {
					return readList(links);
				}
			});

			return pfn({
				apiToken: apiToken
			})
				.catch(( err ) => {
					assert.equal(err, 'Error while syncing with Pinboard: something went wrong');
				});

		});

	});

	describe('Invalid API token', function () {

		const mock = prepareMock({
			links: links,
			invalidApiToken: true
		});
		before(mock.before);
		after(mock.after);

		it('should reject if Pinboard API token is invalid', function () {

			const pfn = proxyquire('../', {
				'read-safari-reading-list': () => {
					return readList(links);
				}
			});

			return pfn({
				apiToken: apiToken
			})
				.catch(( err ) => {
					assert.equal(err, 'Unknown error occured while syncing with Pinboard.');
				});

		});

	});

});

describe('Error status code', function () {

	const mock = prepareMock({
		links: links,
		errorStatusCode: true,
		success: true
	});
	before(mock.before);
	after(mock.after);

	it('should handle error status code', function () {

		return fn(links, {
			apiToken: apiToken
		})
			.then(( res ) => {
				assert.equal(res.length, 3);
				assert.deepEqual(res, [
					{
						url: 'http://example.com/katie',
						pinboardResponse: {
							'result_code': 'done'
						}
					},
					{
						url: 'http://example.com/lacey',
						pinboardResponse: {
							'result_code': 'done'
						}
					},
					{
						url: 'http://example.com/@callie',
						pinboardResponse: {
							'result_code': 'done'
						}
					}
				]);
			});

	});

});
