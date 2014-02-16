var FeedParser = require('feedparser')
  , request = require('request'), Q = require('q');

var processSource = function(sourceId) { 
  
};

var processFeed = function(sourceId, url, callback) {
  var req = request('http://www.viralnova.com/feed')
    , feedparser = new FeedParser({feedurl: url}),
     deferred = Q.defer(), 
    items = [];
  req.on('error', function(error){
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
    while (item = stream.read()) {
      items.push(item);
    }
  });
  feedparser.on('end', function() {
    if(callback){
      callback(null, items);
    }
    else{
      deferred.resolve(items);
    }
  });
  if(!callback){
    return deferred.promise;    
  }
};

module.exports.processFeed = processFeed;