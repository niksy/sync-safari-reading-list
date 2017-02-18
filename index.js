'use strict';

const pify = require('pify');
const readList = require('read-safari-reading-list');
const writeList = require('write-safari-reading-list');
const Pinboard = require('node-pinboard');
const got = require('got');
const stripMobileUrl = require('strip-mobile-url');

/**
 * @param  {Object} item
 * @param  {Boolean} cleanUrls
 *
 * @return {Promise}
 */
function prepareItem ( item, cleanUrls ) {
	const promise = cleanUrls ? got.head(item.url) : Promise.resolve({ url: item.url });
	return promise
		.then(( res ) => {
			return res.url;
		}, () => {
			return item.url;
		})
		.then(( url ) => {
			return {
				url: cleanUrls ? stripMobileUrl(url) : url,
				description: item.title,
				toread: 'yes'
			};
		});
}

/**
 * @param  {Pinboard} pinboard
 * @param  {Object} item
 *
 * @return {Promise}
 */
function syncItem ( pinboard, item ) {
	return pify(pinboard.add.bind(pinboard))(item)
		.then(( res ) => {
			if ( typeof res === 'undefined' ) {
				return Promise.reject('Unknown error occured while syncing with Pinboard.');
			}
			if ( res.result_code !== 'done' ) {
				return Promise.reject(`Error while syncing with Pinboard: ${res.result_code}`);
			}
			return {
				url: item.url,
				pinboardResponse: res
			};
		});
}

/**
 * @param  {String} fp
 * @param  {Object} opts
 *
 * @return {Promise}
 */
module.exports = ( fp, opts ) => {

	if ( typeof fp !== 'string' ) {
		opts = fp;
		fp = undefined; // eslint-disable-line no-undefined
	}

	opts = Object.assign({
		cleanUrls: true
	}, opts || {});

	if ( opts && !opts.apiToken ) {
		return Promise.reject('Pinboard API token is not provided.');
	}

	const pinboard = new Pinboard(opts.apiToken);

	return readList(fp)
		.then(( data ) => {
			return Promise.all(data.map(( item ) => {
				return prepareItem(item, opts.cleanUrls);
			}));
		})
		.then(( data ) => {
			return Promise.all(data.map(( item ) => {
				return syncItem(pinboard, item);
			}));
		})
		.then(( res ) => {
			if ( opts && opts.clearList ) {
				return writeList(fp, [])
					.then(() => {
						return res;
					});
			}
			return res;
		});

};
