// Generic Requirements
var fs = require('fs');
var path = require('path');
var tmp = require('tmp');
var mkdirp = require('mkdirp');
var wrench = require('wrench');

// Config
var config = {};
config.repoPath = path.resolve(process.env.REPO_PATH || "/tmp/repos");
config.port = process.env.PORT || 3000;
config.externalPort = process.env.EXTERNAL_PORT || config.port;
config.externalHost = process.env.EXTERNAL_HOST || 'localhost';

// Web Server Requirements
var http = require('http');
var Handlebars = require('handlebars');

// Git Server Requirements
var pushover = require('pushover');
var repos = pushover(config.repoPath);

// mkdir -p ReposPath
mkdirp.sync(config.repoPath, 0777);

repos.on('push', function (push) {
  // TODO: Reject if more than config.maxRepoSize
  // TODO: Reject if URL hasn't actually been generated
  console.log('push ' + push.repo + '/' + push.commit
    + ' (' + push.branch + ')'
    );
  push.accept();
});

repos.on('fetch', function (fetch) {
  console.log('fetch ' + fetch.repo + '/' + fetch.commit);
  fetch.accept();
});

var server = http.createServer(function (req, res) {

  if(req.headers['user-agent'])
    if(req.headers['user-agent'].match(/git/))
      return repos.handle(req, res);
    else {
      if(req.url !== '/') {
        res.statusCode = 404;
        res.end('404');
      }
    }

  var locals = {};

  if(req.method == 'POST') {

    // Create(d) Repo Container Page
    tmp.dir({template: config.repoPath + '/XXXXXX'}, function (err, path) {
      if (err) throw err;
      locals.gitURL = 'http://' + config.externalHost + ':' + config.externalPort + path.replace(config.repoPath, '') + '.git';
      res.statusCode = 200;
      var source = fs.readFileSync(__dirname + '/index.html').toString();
      var template = Handlebars.compile(source);
      res.end(template(locals));

      setInterval(function() {
        fs.exists(path, function(exists) {
          if(!exists) return false;
          wrench.rmdirRecursive(path, function(err){
            if(err) return console.error(err);
          });
        });
      }, 15000);
    });

  } else {

    // Button Page
    res.statusCode = 200;
    var source = fs.readFileSync(__dirname + '/index.html').toString();
    var template = Handlebars.compile(source);
    res.end(template(locals));
  }

});

if (!module.parent) {
    server.listen(config.port);
} else {
    module.exports = server;
}