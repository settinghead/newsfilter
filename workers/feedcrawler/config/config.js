var conf = require('./conf.json'),
    _ = require('underscore');

module.exports = function(env) {
  env = env || process.env.NODE_ENV || development;
  return _.extend(conf[env], conf['default']);
}