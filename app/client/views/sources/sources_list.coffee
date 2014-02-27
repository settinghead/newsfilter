Template.sources_list.helpers sources: ->
  @sourcesList

Template.sources_list.events 
  "click .delete-source": (e) ->
    id = $(e.target).data("id")
    Sources.remove _id: id
  
  "click .refresh-source-url": (e) ->
    sourceId = $(e.target).data('source-id')
    url = $(e.target).data('url')
    Meteor.call 'feed/queueFeedUrl', sourceId, url, (err, msg) -> console.log err, msg