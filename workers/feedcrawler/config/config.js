var conf = require('./conf.json'),
    _ = require('underscore');

module.exports = function(env) {
  env = env || process.env.NODE_ENV || 'development';
  var result = _.defaults(conf[env], conf['default']);
  result.dbConnStr = result.dbHost + ':' + result.dbPort + '/' + result.dbName;
  return result;
};