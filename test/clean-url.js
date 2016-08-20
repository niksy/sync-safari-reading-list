var assert = require('assert');
var fn = require('../lib/clean-url');

var utmPart = '?utm_campaign=RSS-Feedburner-All-Partial&utm_cid=RSS-Feedburner-All-Partial&utm_medium=feed&utm_source=feedly&utm_reader=feedly&z=last&m=middle&a=first&t=upper-middle';
var cleanUtmPart = '?a=first&m=middle&t=upper-middle&z=last';

describe('clean-url', function () {

	it('should return clean URLs', function () {
		assert.equal(fn(`https://mobile.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `https://twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
		assert.equal(fn(`https://m.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `https://twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
		assert.equal(fn(`https://touch.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `https://twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
		assert.equal(fn(`https://mobile.foo.bar.baz.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `https://foo.bar.baz.twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
		assert.equal(fn(`https://foo.bar.baz.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `https://foo.bar.baz.twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
		assert.equal(fn(`https://www.mobile.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `https://www.twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
		assert.equal(fn(`https://mobile.www.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `https://www.twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
		assert.equal(fn(`mobile.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `http://twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
		assert.equal(fn(`m.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `http://twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
		assert.equal(fn(`touch.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `http://twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
		assert.equal(fn(`mobile.foo.bar.baz.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `http://foo.bar.baz.twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
		assert.equal(fn(`foo.bar.baz.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `http://foo.bar.baz.twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
		assert.equal(fn(`www.mobile.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `http://www.twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
		assert.equal(fn(`mobile.www.twitter.com/niksy/status/766611665244782592${utmPart}#foo`), `http://www.twitter.com/niksy/status/766611665244782592${cleanUtmPart}#foo`);
	});

});
