if(Meteor.isServer) {

  var jobs = Npm.require('kue').createQueue();

  Meteor.methods({
    'feed/queueSource' : function(sourceId) {
      jobs.create('newsfilter/source', {
        sourceId: sourceId
      }).save();
    },
    'feed/queueFeedUrl' : function(sourceId, url) {
      jobs.create('newsfilter/feed', {
        sourceId: sourceId,
        url: url
      }).save();
    }
  });
}

