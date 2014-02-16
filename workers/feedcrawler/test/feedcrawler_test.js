var nock = require('nock'),
    fs = require('fs'),
    http = require('http'),
    path = require('path'),
    config = require('../config/config')('test'),
    should = require('chai').should,
    expect = require('chai').expect,
    monk = require('monk')(config.dbConnStr),
    posts = monk.get('posts'),
    feedcrawler = require('../feedcrawler.js')(monk);

describe('Feed Crawler', function () {
  beforeEach(function(done){
    nock.disableNetConnect();
    posts.remove({});
    done();
  });

  it('Parses a feed URL', function(done){
    var viralFeed = fs.readFileSync(path.join(__dirname, 'fixtures/viralnova.feed.xml'));
    nock('http://www.viralnova.com').
      get('/feed').once().reply('200', viralFeed);
    feedcrawler.processFeed(123, 'http://www.viralnova.com/feed').
      then(function(err, results){
        posts.find({}, function(error, results){
          expect(results.length).to.equal(10);
          done();
      });
    });
  });
});