Template.sources_list.helpers sources: ->
  @sourcesList

Template.sources_list.events 
  "click .delete": (e) ->
    id = $(e.target).data("id")
    Sources.remove _id: id
