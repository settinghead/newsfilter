var conf = require('./conf.json'),
    _ = require('underscore');

module.exports = function(env) {
  env = env || process.env.NODE_ENV || 'development';
  var result = _.defaults(conf[env], conf['default']),
      dbConnStr = result.dbHost + ':' + result.dbPort + '/' + result.dbName;
  var monk = require('monk')(dbConnStr);

  result.getPosts = function(){
    return monk.get('posts');
  }
  result.getSources = function(){
    return monk.get('sources');
  }

  return result;
};