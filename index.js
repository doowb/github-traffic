'use strict';

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

  var results = {};
  resolveRepo(repo, function(err, repo) {
    if (err) return cb(err);
    opts.repo = repo;
    github.get('/repos/:repo/traffic/popular/referrers', opts, function(err, referrers) {
      if (err) return cb(err);
      results.referrers = referrers;
      github.get('/repos/:repo/traffic/popular/paths', opts, function(err, paths) {
        if (err) return cb(err);
        results.paths = paths;
        github.get('/repos/:repo/traffic/views', opts, function(err, views) {
          if (err) return cb(err);
          results.views = views;
          github.get('/repos/:repo/traffic/clones', opts, function(err, clones) {
            if (err) return cb(err);
            results.clones = clones;
            cb(null, results);
          });
        });
      });
    });
  });
};

function resolveRepo(repo, cb) {
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
}
