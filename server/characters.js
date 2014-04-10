/**
 * Character model.
 */
Meteor.publish("characters", function () {
  return Characters.find({}, {fields: {
    name: 1, 
    owner: 1, 
    skills: 1,
    created: 1,
    modified: 1
  }});
});

// Set up access permissions.
Characters.allow({
  insert: function (userId, character) {
    if (isAdmin(userId)) {
      return true;
    }
    return false; // No random inserts, please.
  },
  update: function (userId, character, fields, modifier) {
    if (isAdmin(userId)) {
      return true;
    }
    if (!isOwnedBy(character, userId)) {
      return false;
    }

    var allowed = ['name', 'skills', 'level'];
    if (_.difference(fields, allowed).length) {
      return false; // Tried to write to forbidden field.
    }

    // A good improvement would be to validate the type of the new
    // value of the field (and if a string, the length.) In the
    // future Meteor will have a schema system to makes that easier.
    return true;
  },
  remove: function (userId, character) {
    // You can only remove characters that you created and nobody is going to.
    if (isAdmin(userId)) {
      return true;
    }
    if (!isOwnedBy(character, userId)) {
      return false;
    }
  }
});

// Test if a character is owned by a user.
// TODO: Move to character model as a function?
var isOwnedBy = function(character, userId) {
  var email = Meteor.user().emails[0].address;
  return email !== character.owner;
}

// TODO: Implement.
// TODO: Move elsewhere?
var isAdmin = function() {
  return false;
}

// Populate some test data.
Meteor.startup(function() {
  if (!Characters.findOne()) {
    Characters.insert({
      name: 'Hackett', 
      owner: 'aj@email.com', 
      skills: ['Arcana', 'Stealth', 'Religion'],
      created: Date.now(),
      modified: Date.now()});
    Characters.insert({
      name: 'Grimm', 
      owner: 'jess@email.com', 
      skills: ['Athletics', 'Dungeoneering'],
      created: Date.now(),
      modified: Date.now()});
    Characters.insert({
      name: 'Vetis', 
      owner: 'keith@email.com', 
      skills: ['Streetwise', 'Intimidate'],
      created: Date.now(),
      modified: Date.now()});
    Characters.insert({
      name: 'Celery', 
      owner: 'kevin@email.com', 
      skills: ['Arcana', 'Nature'],
      created: Date.now(),
      modified: Date.now()});
    Characters.insert({
      name: 'Heian', 
      owner: 'dale@email.com', 
      skills: ['Religion', 'Perception'],
      created: Date.now(),
      modified: Date.now()});
    Characters.insert({
      name: 'Jazz', 
      owner: 'joe@email.com', 
      skills: [],
      created: Date.now(),
      modified: Date.now()});
  }
});

