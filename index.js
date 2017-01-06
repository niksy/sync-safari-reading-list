'use strict';

const pify = require('pify');
const readList = require('read-safari-reading-list');
const writeList = require('write-safari-reading-list');
const Pinboard = require('node-pinboard');
const got = require('got');
const stripMobileUrl = require('strip-mobile-url');

/**
 * @param  {Object} item
 *
 * @return {Promise}
 */
function prepareItem ( item ) {
	return got.head(item.url)
		.then(( res ) => {
			return {
				url: res.url,
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
			return res;
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
			return Promise.all(data.map(prepareItem));
		})
		.then(( data ) => {
			return data.map(( item ) => {
				return Object.assign({}, item, {
					url: opts && opts.cleanUrls ? stripMobileUrl(item.url) : item.url
				});
			});
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
