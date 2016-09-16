'use strict';

var co = require('co');
var Github = require('github-base');
var extend = require('extend-shallow');
var parse = require('parse-github-url');
var getUrl = require('get-repository-url');

module.exports = function(repo, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var defaults = {
    headers: {
      Accept: 'application/vnd.github.spiderman-preview+json',
    }
  };

  var opts = extend(defaults, options);
  var github = new Github(opts);
  var get = function(url, options) {
    return function(cb) {
      github.get(url, options, function(err, result) {
        if (err) return cb(err);
        cb(null, result);
      });
    };
  };

  return co(function*() {
    var results = {};
    opts.repo = yield resolveRepo(repo);
    results.referrers = yield get('/repos/:repo/traffic/popular/referrers', opts);
    results.paths = yield get('/repos/:repo/traffic/popular/paths', opts);
    results.views = yield get('/repos/:repo/traffic/views', opts);
    results.clones = yield get('/repos/:repo/traffic/clones', opts);
    return results;
  })
  .then(function(results) {
    if (typeof cb === 'function') {
      cb(null, results);
      return;
    }
    return results;
  }, function(err) {
    if (typeof cb === 'function') {
      cb(err);
      return;
    }
    throw err;
  });
};

function resolveRepo(repo) {
  return function(cb) {
    var parsed = {};
    try {
      parsed = parse(repo);
    } catch (ignore) {}

    if (parsed.owner && parsed.name) {
      cb(null, parsed.repo);
      return;
    }

    getUrl(repo, function(err, url) {
      if (err) return cb(err);
      try {
        parsed = parse(url);
        cb(null, parsed.repo);
      } catch (err) {
        cb(err);
      }
    });
  };
}
