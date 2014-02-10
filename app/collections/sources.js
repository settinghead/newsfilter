Sources = new Meteor.Collection('sources');

Sources.allow({
  insert: isAdminById,
  update: isAdminById,
  remove: isAdminById
});