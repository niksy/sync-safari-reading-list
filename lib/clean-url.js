var url = require('url');
var normalizeUrl = require('normalize-url');
var parseDomain = require('parse-domain');

var mobileSubdomains = ['mobile', 'm', 'touch'];

function cleanSubdomain ( subdomain ) {
	return subdomain
		.split('.')
		.filter(function ( part ) {
			return mobileSubdomains.indexOf(part) === -1;
		})
		.join('.');
}

module.exports = function ( str ) {

	var parsedUrl = url.parse(normalizeUrl(str, {
		stripFragment: false,
		stripWWW: false
	}));
	var parsedDomain = parseDomain(str);
	var host;

	host = [
		cleanSubdomain(parsedDomain.subdomain),
		parsedDomain.domain,
		parsedDomain.tld
	]
		.filter(function ( part ) {
			return part !== '';
		})
		.join('.');

	return url.format(Object.assign(parsedUrl, {
		host: host
	}));
};
