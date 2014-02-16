Template.sources_add.helpers links: ->
  Session.get "linksInvalidator"
  @links

Template.sources_add.events
  "change #url": (e, instance) ->
    url = $(e.target).val()
    if url
      @_id = url
      $.get url, (response) =>
        $nodes = $(response.responseText)
        rssLinks = _.filter($nodes, (node) ->
          node.tagName and node.tagName.toLowerCase() is "link" and (node.type is "application/rss+xml" or node.type is "application/atom+xml")
        )
        rssLinksUrls = _.map(rssLinks, (node) ->
          type = undefined
          type = "rss"  if node.type is "application/rss+xml"
          type = "atom"  if node.type is "application/atom+xml"
          {url: node.href, type: type}
        )
        titleNode = _.find($nodes, (node) ->
          node.tagName and node.tagName.toLowerCase() is "title"
        )
        @title = titleNode.innerText if titleNode
        @links = rssLinksUrls
        # invalidate so as to force an update on UI
        Session.set "linksInvalidator", Math.random()

  "click input[type=submit]": (e, instance) ->
    e.preventDefault()
    Sources.insert this
    Router.go "/sources"
    return

Template.feed_link.events "change .feed-select": (e) ->
  @selected = $(e.target).prop("checked")
  return
