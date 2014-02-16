var nock = require('nock'),
    fs = require('fs'),
    http = require('http'),
    path = require('path'),
    config = require('../config/config')('test'),
    feedcrawler = require('../feedcrawler.js'),
    should = require('chai').should,
    expect = require('chai').expect;

describe('Feed Crawler', function () {
  beforeEach(function(done){
    nock.disableNetConnect();
    done();
  });
  it('Parses a feed URL', function(done){
    var viralFeed = fs.readFileSync(path.join(__dirname, 'fixtures/viralnova.feed.xml'));
    nock('http://www.viralnova.com').
      get('/feed').once().reply('200', viralFeed);
    feedcrawler.processFeed(123, 'http://www.viralnova.com/feed').
      then(function(items){
        expect(items.length).to.equal(10);
      });
    done();
  });
});