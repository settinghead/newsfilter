Template.sources_add.helpers({
  links: function(){
    Session.get('linksInvalidator');
    return this.links;
  }
});

Template.sources_add.events({
  'change #url' : function(e, instance) {
    var _this = this;
    var url = $(e.target).val();
    if(url){
      this._id = url;
      $.get(url, function(response){
          var $nodes = $(response.responseText);
          var rssLinks = _.filter($nodes, function(node){
            return (node.tagName && node.tagName.toLowerCase() === "link"
              && (node.type==="application/rss+xml" || node.type==="application/atom+xml"));
          });
          var rssLinksUrls = _.map(rssLinks, function(node){
            var type;
            if(node.type==="application/rss+xml") type = "rss";
            if(node.type==="application/atom+xml") type = "atom";
            return {url: node.href, type: type};
          });
          var titleNode = _.find($nodes, function(node){
            return node.tagName && node.tagName.toLowerCase === "title";
          })
          _this.links = rssLinksUrls;
          Session.set('linksInvalidator', Math.random());
       });
    }
  },
  'click input[type=submit]': function(e, instance){
    e.preventDefault();
    Sources.insert(this);
  }
});

Template.feed_link.events({
  "change .feed-select": function(e){
    this.selected = $(e.target).prop("checked");
  }
});