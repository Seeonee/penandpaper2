/**
 * Character model.
 */
Meteor.publish("characters", function () {
  return Characters.find({}, {fields: GenericCharacters.publish_fields});
});

// Set up access permissions.
Characters.allow({
  insert: false,
  update: false,
  remove: false
});

// This initializes some methods that can be called from the client,
// like updating, adding, and deleting entries.
Meteor.methods({
  // ------------------------------------------------------------------ //
  // Options should include: name.
  createCharacter: function(options) {
    check(options, {
      name: NonEmptyString
    });

    // Check permissions.
    if (!this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    var user = Meteor.user().emails[0].address;
    
    return GenericCharacters.createCharacter(
      options.name.trim(), 
      user, 
      GenericCharacters.Characters);
  },
  
  // ------------------------------------------------------------------ //
  // Options should include: name.
  deleteCharacter: function(options) {
    check(options, {
      name: NonEmptyString
    });

    // Check permissions.
    if (!this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    var user = Meteor.user().emails[0].address;

    return GenericCharacters.deleteCharacter(
      options.name.trim(), 
      user, 
      GenericCharacters.Characters);
  },
  
  // ------------------------------------------------------------------ //
  // Options is a map of: character name, slot name, level, slot ID (optional), 
  // and clear (optional).
  // Clear allows a levelbox that's both unlocked and unfilled to be relocked;
  // clicking on it without clear will just fill the levelbox.
  characterLevelbox: function(options) {
    // Check permissions.
    if (!this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    check(options, {
      character_name: NonEmptyString,
      slot_name: NonEmptyString,
      slot_level: Match.Integer,
      slot_id: Match.Optional(Match.Integer),
      clear: Match.Optional(Match.Any)
    });
    
    GenericCharacters.characterLevelbox(
      options.character_name.trim(),
      options.slot_name.trim(),
      options.slot_level,
      options.slot_id,
      options.clear,
      GenericCharacters.Characters);
  }
});



// Match functions.

// Match a nonempty string.
var NonEmptyString = Match.Where(function(x) {
  check(x, String);
  return x.trim().length !== 0;
});







// Populate some test data.
Meteor.startup(function() {
  if (!Characters.findOne()) {
    createCharacter('Hackett', 'aj@email.com', GenericCharacters.Characters);
    createCharacter('Grimm', 'jess@email.com', GenericCharacters.Characters);
    createCharacter('Heian', 'dale@email.com', GenericCharacters.Characters);
    createCharacter('Vetis', 'keith@email.com', GenericCharacters.Characters);
    createCharacter('Jazz', 'joe@email.com', GenericCharacters.Characters);
    createCharacter('Celery', 'kevin@email.com', GenericCharacters.Characters);
  }
});

