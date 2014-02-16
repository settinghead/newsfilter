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

process.once( 'SIGTERM', function ( sig ) {
  jobs.shutdown(function(err) {
    console.log( 'Kue is shut down.', err||'' );
    process.exit( 0 );
  }, 5000 );
});