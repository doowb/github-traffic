'use strict';

require('mocha');
var assert = require('assert');
var auth = require('./support/auth');
var traffic = require('../');

describe('github-traffic', function() {
  this.timeout(10000);
  it('should export a function', function() {
    assert.equal(typeof traffic, 'function');
  });

  it('should retrieve referrers for the specified repository', function(cb) {
    traffic.referrers('assemble/assemble', auth, function(err, referrers) {
      if (err) return cb(err);
      try {
        assert(Array.isArray(referrers), 'expected referrers to be an array');
        cb();
      } catch (err) {
        cb(err);
      }
    });
  });

  it('should retrieve paths for the specified repository', function(cb) {
    traffic.paths('assemble/assemble', auth, function(err, paths) {
      if (err) return cb(err);
      try {
        assert(Array.isArray(paths), 'expected paths to be an array');
        cb();
      } catch (err) {
        cb(err);
      }
    });
  });

  it('should retrieve views for the specified repository', function(cb) {
    traffic.views('assemble/assemble', auth, function(err, views) {
      if (err) return cb(err);
      try {
        assert.equal(typeof views, 'object');
        assert(views.hasOwnProperty('count'), 'expected views to have a "count" property');
        assert(views.hasOwnProperty('uniques'), 'expected views to have a "uniques" property');
        assert(views.hasOwnProperty('views'), 'expected views to have a "views" property');
        assert(Array.isArray(views.views), 'expected views.views to be an array');
        cb();
      } catch (err) {
        cb(err);
      }
    });
  });

  it('should retrieve clones for the specified repository', function(cb) {
    traffic.clones('assemble/assemble', auth, function(err, clones) {
      if (err) return cb(err);
      try {
        assert.equal(typeof clones, 'object');
        assert(clones.hasOwnProperty('count'), 'expected clones to have a "count" property');
        assert(clones.hasOwnProperty('uniques'), 'expected clones to have a "uniques" property');
        assert(clones.hasOwnProperty('clones'), 'expected clones to have a "clones" property');
        assert(Array.isArray(clones.clones), 'expected clones.clones to be an array');
        cb();
      } catch (err) {
        cb(err);
      }
    });
  });

  it('should retrieve all of the results for the specified repository', function(cb) {
    traffic('assemble/assemble', auth, function(err, results) {
      if (err) return cb(err);
      try {
        assert.equal(typeof results, 'object');
        assert(results.hasOwnProperty('referrers'), 'expected results to have a "referrers" property');
        assert(Array.isArray(results.referrers), 'expected results.referrers to be an array');

        assert(results.hasOwnProperty('paths'), 'expected results to have a "paths" property');
        assert(Array.isArray(results.paths), 'expected results.paths to be an array');

        assert(results.hasOwnProperty('views'), 'expected results to have a "views" property');
        assert(results.views.hasOwnProperty('count'), 'expected results.views to have a "count" property');
        assert(results.views.hasOwnProperty('uniques'), 'expected results.views to have a "uniques" property');
        assert(results.hasOwnProperty('views'), 'expected results.views to have a "views" property');
        assert(Array.isArray(results.views.views), 'expected results.views.views to be an array');

        assert(results.hasOwnProperty('clones'), 'expected results to have a "clones" property');
        assert(results.clones.hasOwnProperty('count'), 'expected results.clones to have a "count" property');
        assert(results.clones.hasOwnProperty('uniques'), 'expected results.clones to have a "uniques" property');
        assert(results.hasOwnProperty('clones'), 'expected results.clones to have a "clones" property');
        assert(Array.isArray(results.clones.clones), 'expected results.clones.clones to be an array');
        cb();
      } catch (err) {
        cb(err);
      }
    });
  });
});
