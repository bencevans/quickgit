
var assert = require('assert')
, spawn = require('child_process').spawn
, path = require('path')
, request = require('request')
, cheerio = require('cheerio')
, freeport = require('freeport');

describe('QuickGit', function (){

	var pushCommand;
	var cloneCommand;
	var quickGitInstance;
	var quickGitURL;

	before(function (done) {

		this.timeout = 5000;

		freeport(function(err, port) {
			if (err) return assert.equal(null, err);

			quickGitInstance = require('./app.js');
			assert.ok(quickGitInstance);

			quickGitInstance.listen(port);
			quickGitURL = 'http://127.0.0.1:' + port;

			done();
		});

	});

	it('provide a push and clone command', function (done) {
		request({url:quickGitURL, method:'POST'}, function (err, res, body) {
			if(err) return done(err);

			var $ = cheerio.load(body);

			pushCommand = $('#push').html();
			assert.ok(pushCommand.match(/^git push https?:\/\/.+:[0-9]+\/.+\.git master$/));

			cloneCommand = $('#clone').html();
			assert.ok(cloneCommand.match(/^git clone https?:\/\/.+:[0-9]+\/.+\.git$/));

			done();
		});
	});

	it('should accept a push and a clone');

	it('should decline a push if container isn\'t created');

});