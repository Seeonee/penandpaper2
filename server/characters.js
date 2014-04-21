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
  },
  
  // ------------------------------------------------------------------ //
  // Options is a map of: character name.
  characterLevelDown: function(options) {
    // Check permissions.
    if (!this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    check(options, {
      character_name: NonEmptyString
    });
    
    GenericCharacters.characterLevelDown(
      options.character_name.trim(), 
      GenericCharacters.Characters);
  }, 
  
  // ------------------------------------------------------------------ //
  // Options is a map of: character name.
  characterLevelUp: function(options) {
    // Check permissions.
    if (!this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    check(options, {
      character_name: NonEmptyString
    });
    
    GenericCharacters.characterLevelUp(
      options.character_name.trim(), 
      GenericCharacters.Characters);
  }, 
  
  // ------------------------------------------------------------------ //
  // Options is a map of: character name.
  characterSetDeity: function(options) {
    // Check permissions.
    if (!this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    check(options, {
      character_name: NonEmptyString,
      deity: Match.Any
    });
    
    GenericCharacters.characterSetDeity(
      options.character_name.trim(), 
      options.deity.trim(),
      GenericCharacters.Characters);
  },
  
  // ------------------------------------------------------------------ //
  // Options is a map of: character name, slot name, slot ID, skill ID.
  characterEquipSlot: function(options) {
    // Check permissions.
    if (!this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    check(options, {
      character_name: NonEmptyString,
      slot_name: NonEmptyString,
      slot_id: Match.Optional(Match.Integer),
      skill_id: NonEmptyString,
    });
    
    GenericCharacters.characterEquipSlot(
      options.character_name.trim(), 
      options.slot_name.trim(),
      options.slot_id,
      options.skill_id,
      GenericCharacters.Characters);
  },
  
  // ------------------------------------------------------------------ //
  // Options is a map of: character name, slot name, slot ID.
  characterUnequipSlot: function(options) {
    // Check permissions.
    if (!this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    check(options, {
      character_name: NonEmptyString,
      slot_name: NonEmptyString,
      slot_id: Match.Optional(Match.Integer),
    });
    
    GenericCharacters.characterUnequipSlot(
      options.character_name.trim(), 
      options.slot_name.trim(),
      options.slot_id,
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
    GenericCharacters.createCharacter('Hackett', 'aj@email.com', GenericCharacters.Characters);
    GenericCharacters.createCharacter('Grimm', 'jess@email.com', GenericCharacters.Characters);
    GenericCharacters.createCharacter('Heian', 'dale@email.com', GenericCharacters.Characters);
    GenericCharacters.createCharacter('Vetis', 'keith@email.com', GenericCharacters.Characters);
    GenericCharacters.createCharacter('Jazz', 'joe@email.com', GenericCharacters.Characters);
    GenericCharacters.createCharacter('Celery', 'kevin@email.com', GenericCharacters.Characters);
  }
});

