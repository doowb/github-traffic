'use strict';

var co = require('co');
var Github = require('github-base');
var extend = require('extend-shallow');
var parse = require('parse-github-url');
var getUrl = require('get-repository-url');

var defaults = {
  headers: {
    Accept: 'application/vnd.github.spiderman-preview+json',
  }
};
var github;

/**
 * Get the last 14 days (this is Github's limitation) of Github traffic for the specified repository.
 * The results will contain 4 keys (one for each of the traffic endpoints specified in the [api documentation](https://developer.github.com/v3/repos/traffic/)).
 * See the [example results](/example-results.json) for the expanded results from the example.
 * See the other methods below to get results for a specific endpoint.
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
 *   //=> {
 *   //=>   referrers: [ ... ],
 *   //=>   paths: [ ... ],
 *   //=>   views: {
 *   //=>     count: 4043,
 *   //=>     uniques: 1155,
 *   //=>     views: [ ... ]
 *   //=>   },
 *   //=>   clones: {
 *   //=>     count: 47,
 *   //=>     uniques: 38,
 *   //=>     clones: [ ... ]
 *   //=>   }
 *   //=> }
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

  var opts = init(options);
  return co(function*() {
    var results = {};
    opts.repo = yield resolveRepo(repo);
    results.referrers = yield module.exports.referrers(opts.repo, opts);
    results.paths = yield module.exports.paths(opts.repo, opts);
    results.views = yield module.exports.views(opts.repo, opts);
    results.clones = yield module.exports.clones(opts.repo, opts);
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

/**
 * Get [referrers](https://developer.github.com/v3/repos/traffic/#list-referrers) for the specified repository from the Github traffic api.
 *
 * ```js
 * var options = {
 *   username: 'doowb',
 *   password: '**********'
 * };
 *
 * traffic.referrers('assemble/assemble', options, function(err, results) {
 *   if (err) return console.error(err);
 *   console.log(results);
 *   //=> [
 *   //=>   { referrer: 'Google', count: 765, uniques: 377 },
 *   //=>   ...
 *   //=> ],
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

module.exports.referrers = function(repo, options, cb) {
  return get('/repos/:repo/traffic/popular/referrers', repo, options, cb);
};

/**
 * Get [paths](https://developer.github.com/v3/repos/traffic/#list-paths) for the specified repository from the Github traffic api.
 *
 * ```js
 * var options = {
 *   username: 'doowb',
 *   password: '**********'
 * };
 *
 * traffic.paths('assemble/assemble', options, function(err, results) {
 *   if (err) return console.error(err);
 *   console.log(results);
 *   //=> [
 *   //=>   {
 *   //=>     path: '/assemble/assemble',
 *   //=>     title: 'GitHub - assemble/assemble: Static site generator and rapid prototyping frame...',
 *   //=>     count: 1551,
 *   //=>     uniques: 839
 *   //=>   },
 *   //=>   ...
 *   //=> ],
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

module.exports.paths = function(repo, options, cb) {
  return get('/repos/:repo/traffic/popular/paths', repo, options, cb);
};

/**
 * Get [views](https://developer.github.com/v3/repos/traffic/#views) for the specified repository from the Github traffic api.
 *
 * ```js
 * var options = {
 *   username: 'doowb',
 *   password: '**********'
 * };
 *
 * traffic.views('assemble/assemble', options, function(err, results) {
 *   if (err) return console.error(err);
 *   console.log(results);
 *   //=> {
 *   //=>   count: 4043,
 *   //=>   uniques: 1155,
 *   //=>   views: [ ... ]
 *   //=> }
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

module.exports.views = function(repo, options, cb) {
  return get('/repos/:repo/traffic/views', repo, options, cb);
};

/**
 * Get [clones](https://developer.github.com/v3/repos/traffic/#clones) for the specified repository from the Github traffic api.
 *
 * ```js
 * var options = {
 *   username: 'doowb',
 *   password: '**********'
 * };
 *
 * traffic.clones('assemble/assemble', options, function(err, results) {
 *   if (err) return console.error(err);
 *   console.log(results);
 *   //=> {
 *   //=>   count: 47,
 *   //=>   uniques: 38,
 *   //=>   clones: [ ... ]
 *   //=> }
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

module.exports.clones = function(repo, options, cb) {
  return get('/repos/:repo/traffic/clones', repo, options, cb);
};

function init(options) {
  var opts = extend(defaults, options);
  if (!github) {
    github = new Github(opts);
  }
  return opts;
}

function get(url, repo, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  return co(function*() {
    var opts = init(options);
    if (typeof opts.repo === 'undefined') {
      opts.repo = yield resolveRepo(repo);
    }

    return yield function(cb) {
      github.get(url, options, function(err, result) {
        if (err) return cb(err);
        cb(null, result);
      });
    };
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
}

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
