var jobs = Npm.require('kue').createQueue();

Meteor.methods({
  'feed/queueSource' : function(sourceId) {
    jobs.create('feed', {
      sourceId: sourceId;
    });
  }
});
