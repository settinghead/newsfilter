if(Meteor.isServer) {

  var jobs = Npm.require('kue').createQueue(),
  w = Npm.require('winston');

  Meteor.methods({
    'feed/queueSource' : function(sourceId) {
      w.info('Job added to feed/queueSource, source id = ', sourceId);
      jobs.create('newsfilter/source', {
        sourceId: sourceId
      }).save();
    },
    'feed/queueFeedUrl' : function(sourceId, url) {
      w.info('Job added to feed/queueFeedUrl, source id = ', sourceId, ', url = ', url);
      jobs.create('newsfilter/feed', {
        sourceId: sourceId,
        url: url
      }).save();
    }
  });
}

