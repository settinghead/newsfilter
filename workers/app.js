var kue = require('kue')
  , cluster = require('cluster')
  , jobs = kue.createQueue(),
    cluster = require('cluster'),
    numCPUs = require('os').cpus().length,
    feedCrawler = require('./feedcrawler/feedcrawler.js'),
    w = require('winston');

if (cluster.isMaster) {

  kue.app.listen(3010);
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    w.info('Worker', i , 'started.');
    cluster.fork();
  }

  cluster.on('death', function(worker) {
    w.info('worker ' + worker.pid + ' died');
  });
} else {
  jobs.process('newsfilter/source', function(job, done){
    feedCrawler.processSource(job.data.sourceId);
    done();
  });

  jobs.process('newsfilter/feed', function(job, done){
    feedCrawler.processFeed(job.data.sourceId, job.data.url);
    done();
  });
}

process.once( 'SIGTERM', function ( sig ) {
  jobs.shutdown(function(err) {
    w.info( 'Kue is shut down.', err||'' );
    process.exit( 0 );
  }, 5000 );
});