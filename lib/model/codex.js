/**
 * Models.
 */
Codex = new Meteor.Collection('codex');

// Options is a map of {tags: values}.
// The callback takes (err, result).
createCodice = function (options, callback) {
  var id = Random.id();
  Meteor.call('createCodice', _.extend({ _id: id }, options), callback);
  return id;
};

