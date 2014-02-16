var kue = require('kue')
  , cluster = require('cluster')
  , jobs = kue.createQueue();

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    console.log('Worker', i , 'started.');
    cluster.fork();
  }

  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died');
  });
} else {
  jobs.process('feed', function(job, done){
    console.log(job);
    done();
  });
}