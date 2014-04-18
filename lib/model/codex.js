/**
 * Models.
 */
Codex = new Meteor.Collection('codex');

// Options is a map of {tags: values}.
// The callback takes (err, result).
createCodice = function (options, callback) {
  Meteor.call('createCodice', options, callback);
};

// Options is a map of {_id: id}.
// The callback takes (err, result).
deleteCodice = function (options, callback) {
  Meteor.call('deleteCodice', options, callback);
};

// Options is a map of {tags: values}.
// Note that options *should* include a key of _id,
// since the name could be getting changed.
// The callback takes (err, result).
updateCodice = function (options, callback) {
  Meteor.call('updateCodice', options, callback);
};

