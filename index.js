var pify = require('pify');
var readList = require('read-safari-reading-list');
var writeList = require('write-safari-reading-list');
var Pinboard = require('node-pinboard');
var request = require('request');
var cleanUrl = require('./lib/clean-url');

function prepareItem ( item ) {
	return pify(request, { multiArgs: true })({
		method: 'HEAD',
		url: item.url,
		followAllRedirects: true
	})
		.then(function ( res ) {
			return {
				url: res[0].request.href,
				description: item.title,
				toread: 'yes'
			};
		});
}

module.exports = function ( fp, opts ) {

	var pinboard;

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

	pinboard = new Pinboard(opts.apiToken);

	return readList(fp)
		.then(function ( data ) {
			return Promise.all(data.map(prepareItem));
		})
		.then(function ( data ) {
			return data.map(function ( item ) {
				return Object.assign({}, item, {
					url: opts && opts.cleanUrls ? cleanUrl(item.url) : item.url
				});
			});
		})
		.then(function ( data ) {
			return Promise.all(data.map(function ( item ) {
				return pify(pinboard.add.bind(pinboard))(item);
			}));
		})
		.then(function ( res ) {
			if ( opts && opts.clearList ) {
				return writeList(fp, [])
					.then(function () {
						return res;
					});
			}
			return res;
		});

};
