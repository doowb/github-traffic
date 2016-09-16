'use strict';

var co = require('co');
var Github = require('github-base');
var extend = require('extend-shallow');
var parse = require('parse-github-url');
var getUrl = require('get-repository-url');

/**
 * Get the last 14 days of Github traffic for the specified repository.
 *
 * ```js
 * var options = {
 *   username: 'doowb',
 *   password: '**********'
 * };
 *
 * traffic('assemble/assemble', options, function(err, results) {
 *   if (err) return console.error(err);
 *   console.log(results);
 * });
 * ```
 * @param  {String} `repo` Full repository to get traffic, formatted as `:owner/:repo`. If the repository is published to NPM, the NPM name may be used.
 * @param  {Object} `options` Options containing the Github authentication information. This is required since user's must be administrators on the repository to retrieve traffic information.
 * @param  {String} `options.username` Github username of the repository administrator retrieving the traffic information. This is required if an oauth token is not used.
 * @param  {String} `options.password` Github user's password of the repository administrator retrieving the traffic information. This is required if an oauth token is not used.
 * @param  {String} `options.token` Github oauth token for the repository administrator retrieving the traffic informatino. This is required if the `username/password` combination is not used.
 * @param  {Function} `cb` Optional callback function that will be called with error information or the results. When omitted a Promise is returned.
 * @return {Promise} Promise with the traffic information when ready.
 * @api public
 */

module.exports = function traffic(repo, options, cb) {
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
