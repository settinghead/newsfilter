Template.sources_list.helpers({
  sources: function() {
    return this.sourcesList;
  }
});

Template.sources_list.events({
  'click .delete' : function(e) {
    var id = $(e.target).data('id');
    Sources.remove({_id: id});
  }
});