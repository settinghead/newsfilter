var FeedParser = require('feedparser'),
    request = require('request'), Q = require('q'),
    config = require('./config/config')(),
    posts = config.getPosts(),
    sources = config.getSources(),
    async = require('async'), 
    _ = require('underscore'),
    w = require('winston'),
    shortid = require('shortid');

var processSource = function(sourceId, callback) {
  w.info('Processing source ', sourceId, '...');
  var deferred = Q.defer();
  sources.findOne({_id: sourceId}, function(err, source) {
    var selectedLinks = _.filter(source.links, function(link){return link.selected});
    async.map(selectedLinks, function(link, callback){
      return processFeed(source._id, link.url, callback);
    }, 
    function(err, results){
        if(callback){
          callback(err, results);
        }
        else if(err){
          w.error('Error occurred while processing source ', sourceId, ': ', err, '...');
          deferred.reject(err);
        }
        else{
          deferred.resolve(results);          
        }
    });
  });
  if(!callback){
    return deferred.promise;
  }
  else{
    callback();
  }
};

var processFeed = function(sourceId, url, callback) {
  w.info('Processing feed ', url, '...');
  var req = request(url)
    , feedparser = new FeedParser({feedurl: url}),
     deferred = Q.defer(), items = [];
  req.on('error', function(error){
    w.error('Error occurred while retrieving feed ', url, ': ', error);
    if(callback){
      callback(error);
    }
    else{
      deferred.reject(error);
    }
  });
  req.on('response', function (res) {
    var stream = this;
    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
    stream.pipe(feedparser);
  });


  feedparser.on('error', function(error){
    w.error('Error occurred while parsing feed ', url, ': ', error);
    if(callback){
      callback(error);
    }
    else{
      deferred.reject(error);
    }
  });
  feedparser.on('readable', function() {
    // This is where the action is!
    var stream = this
      , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
      , item;
      while(item = stream.read()){  
          items.push({
            headline: item.title,
            body: item.description,
            createdAt: new Date().getTime(),
            votes: 0,
            comments: 0,
            baseScore: 0,
            score: 0,
            inactive: false,
            status: 1,
            sourceId: sourceId,
            url: item.origlink || item.link
        });
      }
  });
  feedparser.on('end', function() {
    async.map(items,
      function(doc, callback){
        posts.findOne({url: doc.url}, function(err, existingDoc){
          if(!existingDoc){
            w.info('Creating post ', doc.url, '...');
            doc._id = shortid();
            posts.insert(doc, {}, callback);
          }
          else {
            callback(err, existingDoc);
          }
        });
      },
      function(err, results){
        w.info('Feed ', url, 'professing complete. ');
        if(callback){
          callback(err, results);
        }
        else if(err){
          deferred.reject(err);
        }
        else{
          deferred.resolve(results);          
        }
    });
  });
  if(!callback){
    return deferred.promise;    
  }
};

module.exports.processFeed = processFeed;
module.exports.processSource = processSource;
