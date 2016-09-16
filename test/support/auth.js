var Store = require('data-store');
var store = new Store('github-traffic-tests');
var auth = store.get('auth');

if (!auth) {
  var argv = require('yargs-parser')(process.argv.slice(2), {
    alias: {password: 'p', username: 'u'}
  });

  auth = {};
  auth.username = process.env.GITHUB_USERNAME || argv.username || argv._[0];
  auth.password = process.env.GITHUB_PASSWORD || argv.password || argv._[1];
}

if (auth.username && auth.password) {
  store.set('auth', auth);
} else {
  console.error('please specific authentication details');
  console.error('--username, -u (or first arg)');
  console.error('--password, -p (or second arg)');
  process.exit(1);
}

module.exports = auth;
