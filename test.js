'use strict';

require('mocha');
var assert = require('assert');
var traffic = require('./');

describe('github-traffic', function() {
  it('should export a function', function() {
    assert.equal(typeof traffic, 'function');
  });
});
