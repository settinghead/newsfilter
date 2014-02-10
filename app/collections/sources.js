Sources = new Meteor.Collection('sources');

Sources.allow({
  insert: isAdminById,
  update: isAdminById,
  remove: isAdminById
});

if(Meteor.isServer){
  Sources._ensureIndex({"links.url" : 1});
}
