var FeedParser = require('feedparser')
  , request = require('request'), Q = require('q'),
  config = require('./config/config')(),
   async = require('async');

module.exports = function(monk) {
  var posts = monk.get('posts');

  var processSource = function(sourceId, callback) { 

  };

  var processFeed = function(sourceId, url, callback) {
    var req = request('http://www.viralnova.com/feed')
      , feedparser = new FeedParser({feedurl: url}),
       deferred = Q.defer(), items = [];
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
              url: item.origlink || item.link
          });
        }
    });
    feedparser.on('end', function() {
      async.map(items,
        function(doc, callback){
          posts.findOne({url: doc.url}, function(err, doc){
            if(!doc){
              posts.insert(doc, {}, callback);
            }
            else {
              console.log(doc);
              callback();
            }
          });
        },
        function(err, results){
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
  return {
    processFeed: processFeed
  }
};