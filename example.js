'use strict';

var extend = require('extend-shallow');
var traffic = require('./');
var options = extend({}, require('./auth.json'));

traffic('assemble/assemble', options, function(err, results) {
  if (err) return console.error(err);
  console.log(JSON.stringify(results, null, 2));
});
