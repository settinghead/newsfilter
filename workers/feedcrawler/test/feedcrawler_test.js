var nock = require('nock'),
    fs = require('fs'),
    http = require('http'),
    path = require('path'),
    config = require('../config/config')('test'),
    posts = config.getPosts(),
    should = require('chai').should,
    expect = require('chai').expect,
    feedcrawler = require('../feedcrawler.js');

describe('Feed Crawler', function () {
  beforeEach(function(done){
    nock.disableNetConnect();
    posts.remove({});
    done();
  });

  it('parses a feed URL', function(done){
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