'use strict';

const url = require('url');
const normalizeUrl = require('normalize-url');
const parseDomain = require('parse-domain');

const mobileSubdomains = ['mobile', 'm', 'touch'];

/**
 * @param  {String} subdomain
 *
 * @return {String}
 */
function cleanSubdomain ( subdomain ) {
	return subdomain
		.split('.')
		.filter(( part ) => {
			return mobileSubdomains.indexOf(part) === -1;
		})
		.join('.');
}

module.exports = ( str ) => {

	const parsedUrl = url.parse(normalizeUrl(str, {
		stripFragment: false,
		stripWWW: false
	}));
	let parsedDomain = parseDomain(str);

	if ( parsedDomain === null ) {
		parsedDomain = parseDomain(str.replace(/@/g, ''));
	}

	const host = [
		cleanSubdomain(parsedDomain.subdomain),
		parsedDomain.domain,
		parsedDomain.tld
	]
		.filter(( part ) => {
			return part !== '';
		})
		.join('.');

	return url.format(Object.assign(parsedUrl, {
		host: host
	}));
};
