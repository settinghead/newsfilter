var nock = require('nock'),
    fs = require('fs'),
    http = require('http'),
    path = require('path'),
    config = require('../config/config')('test'),
    posts = config.getPosts(),
    sources = config.getSources(),
    should = require('chai').should,
    expect = require('chai').expect,
    feedcrawler = require('../feedcrawler.js'),
    sourceId, 
    viralFeed = fs.readFileSync(path.join(__dirname, 'fixtures/viralnova.feed.xml'));

describe('Feed Crawler', function () {
  beforeEach(function(done){
    nock.disableNetConnect();
    posts.remove({}, function(){
      sources.remove({}, function(){
        sources.insert({
          url: 'http://www.viralnova.com',
          title: 'viralnova',
          links: [
            { type: 'rss', url: 'http://www.viralnova.com/feed', selected: true }
          ]
        }, function(err, doc){
          expect(doc.url).to.equal('http://www.viralnova.com');
          sourceId = doc._id;
          done();
        });
      });
    });
  });

  it('parses a feed and stores posts', function(done){
    nock('http://www.viralnova.com').get('/feed').once().reply('200', viralFeed);
    feedcrawler.processFeed(123, 'http://www.viralnova.com/feed').
      then(function(err, results){
        posts.find({}, {fields:{sourceId: 1}}, function(error, results){
          expect(results.length).to.equal(10);
          expect(results[0].sourceId).to.equal(123);
          done();
        });
      });
  });

it('avoids duplicate posts', function(done){
    nock('http://www.viralnova.com').get('/feed').twice().reply('200', viralFeed);
    feedcrawler.processFeed(123, 'http://www.viralnova.com/feed').
      then(function(err, results){
        feedcrawler.processFeed(123, 'http://www.viralnova.com/feed').
        then(function(err, results){
          posts.find({}, function(error, results){
            expect(results.length).to.equal(10);
            done();
          });
        });
      });
  });

  it('parse a source and stores posts', function(done){
    nock('http://www.viralnova.com').get('/feed').once().reply('200', viralFeed);
    feedcrawler.processSource(sourceId).then(function(err, results){
      posts.find({}, function(error, results){
          expect(results.length).to.equal(10);
          done();
        });
    });
  });

});