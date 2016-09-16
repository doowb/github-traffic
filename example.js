'use strict';

var extend = require('extend-shallow');
var traffic = require('./');
var options = extend({}, require('./auth.json'));

traffic('assemble/assemble', options)
  .then(function(results) {
    console.log(JSON.stringify(results, null, 2));
  }, console.error);
