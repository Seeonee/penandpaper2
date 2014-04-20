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
    // Check permissions.
    if (!this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    var user = Meteor.user().emails[0].address;
    return createCharacter(options.name, user);
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
    options.name = options.name.trim();
    var character = characterExists(options.name);
    if (!character) {
      throw new Meteor.Error(403, "Can't delete nonexistant character '" + options.name + "'");
    }
    var user = Meteor.user().emails[0].address;
    if (user !== character.owner) {
      throw new Meteor.Error(403, "You don't have permission to delete that character");
    }
    
    Characters.remove({_id: character._id});
    return name;
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
    
    // Check character.
    options.character_name = options.character_name.trim();
    var character = Characters.findOne({name: {
      $regex: RegExp.quote(options.character_name),
      $options: 'i'
    }});
    if (!character) {
      throw new Meteor.Error(403, "Character does not exist");
    }
    var user = Meteor.user().emails[0].address;
    if (user !== character.owner) {
      throw new Meteor.Error(403, "You don't have permission to edit that character");
    }
    
    // Get the slot being modified.
    options.slot_name = options.slot_name.trim();
    var edited_slots = _.filter(character.slots, function(v, k) {
      return (k === options.slot_name);
    });
    if (edited_slots.length > 0) {
      edited_slots = edited_slots[0];
    } else {
      throw new Meteor.Error(403, "Slot does not exist");
    }
    var slot = null;
    if (options.slot_id) {
      options.slot_id = options.slot_id - 1; // Switch to zero-based index.
      if (options.slot_id >= edited_slots.length) {
        throw new Meteor.Error(403, "Slot does not exist");
      }
      slot = edited_slots[options.slot_id];
    } else {
      slot = edited_slots;
    }
    
    // Now let's make sure the levelbox exists.
    if (!(options.slot_level in slot)) {
      throw new Meteor.Error(403, "Levelbox does not exist");
    }
    
    // Okay, just about time to begin doing actual work.
    var skillPointsRemaining = character.points.skill_points - character.points_spent.skill_points;
    var keyPointsRemaining = character.points.key_points - character.points_spent.key_points;
        
    // Get the levelboxes we'll be working with.
    var levelbox = slot[options.slot_level];
    var previous_levelbox = null;
    if ((options.slot_level - 1) in slot) {
      previous_levelbox = slot[options.slot_level - 1];
    }
    var next_levelbox = null;
    if ((options.slot_level + 1) in slot) {
      next_levelbox = slot[options.slot_level + 1];
    }
    // Time to make sure someone didn't send us homemade inputs...
    options.clear = options.clear || false;
    if (!options.clear) {
      // We're either filling or unlocking.
      if (levelbox.filled == 1) {
        throw new Meteor.Error(403, "Slot level is already filled");
      }
      if (levelbox.lock == 1 && levelbox.unlocked == 0) {
        // We can't unlock it if the previous box is locked.
        if (previous_levelbox != null) {
          if (previous_levelbox.lock == 1 && previous_levelbox.unlocked == 0) {
            throw new Meteor.Error(403, "Unlock previous slot level first");
          }
        }
        // Can we afford it?
        if (keyPointsRemaining < 1) {
          throw new Meteor.Error(403, "Not enough key points remaining");
        }
        character_do_unlock(
          character, 
          options.slot_name, 
          options.slot_id, 
          options.slot_level);
      } else {
        // We can't fill it if the previous box is unfilled.
        if (previous_levelbox != null) {
          if (previous_levelbox.filled == 0 && !previous_levelbox.learned_by_default) {
            throw new Meteor.Error(403, "Fill previous slot level first");
          }
        }
        // Can we afford it?
        if ((skillPointsRemaining - levelbox.cost) < 0) {
          throw new Meteor.Error(403, "Not enough skill points remaining");
        }
        character_do_fill(
          character, 
          options.slot_name, 
          options.slot_id, 
          options.slot_level, 
          levelbox.cost);
      }
    } else {
      // We're either clearing or relocking.
      if (levelbox.filled == 0) {
        if (levelbox.lock != 1 || levelbox.unlocked != 1) {
          throw new Meteor.Error(403, "Slot level is not unlocked");
        }
      }
      if (levelbox.filled == 1) {
        // We can't clear it if the previous box is filled.
        if (previous_levelbox != null) {
          if (previous_levelbox.fill == 1 && !previous_levelbox.learned_by_default) {
            throw new Meteor.Error(403, "Clear previous slot level first");
          }
        }
        // (Or if something's equipped.)
        if (slot.equipped != null) {
          throw new Meteor.Error(403, "Unequip slot first");
        }

        // Can we afford it?
        if ((skillPointsRemaining + levelbox.cost) < 0) {
          throw new Meteor.Error(403, "You must clear other skill levels first");
        }
        character_do_clear(
          character, 
          options.slot_name, 
          options.slot_id, 
          options.slot_level, 
          levelbox.cost);
      } else if (levelbox.lock == 1) {
        // We can't relock it if the previous box is unlocked.
        if (previous_levelbox != null) {
          if (previous_levelbox.lock == 1 && previous_levelbox.unlocked == 1) {
            throw new Meteor.Error(403, "Relock previous slot level first");
          }
        }
        character_do_relock(
          character, 
          options.slot_name, 
          options.slot_id, 
          options.slot_level);
      }
    }
  }
});

// Fill in a slot. This assumes error checking's been done.
// slot_id may be null.
var character_do_fill = function(character, slot_name, slot_id, slot_level, cost) {
  var new_set = {};
  new_set[create_key(slot_name, slot_id, slot_level) + '.filled'] = 1;
  new_set['points_spent.skill_points'] = character.points_spent.skill_points + cost;
  Characters.update({ _id: character._id}, { $set: new_set});
}

// Clear a slot. This assumes error checking's been done.
// slot_id may be null.
var character_do_clear = function(character, slot_name, slot_id, slot_level, cost) {
  var new_set = {};
  new_set[create_key(slot_name, slot_id, slot_level) + '.filled'] = 0;
  new_set['points_spent.skill_points'] = character.points_spent.skill_points - cost;
  Characters.update({ _id: character._id}, { $set: new_set});
}

// Unlock a slot. This assumes error checking's been done.
// slot_id may be null.
var character_do_unlock = function(character, slot_name, slot_id, slot_level) {
  var new_set = {};
  new_set[create_key(slot_name, slot_id, slot_level) + '.unlocked'] = 1;
  new_set['points_spent.key_points'] = character.points_spent.key_points + 1;
  Characters.update({ _id: character._id}, { $set: new_set});
}

// Relock a slot. This assumes error checking's been done.
// slot_id may be null.
var character_do_relock = function(character, slot_name, slot_id, slot_level) {
  var new_set = {};
  new_set[create_key(slot_name, slot_id, slot_level) + '.unlocked'] = 0;
  new_set['points_spent.key_points'] = character.points_spent.key_points - 1;
  Characters.update({ _id: character._id}, { $set: new_set});
}

// Create a $set key for a particular slot's levelbox.
var create_key = function(slot_name, slot_id, slot_level) {
  var key = 'slots.' + slot_name;
  if (slot_id != null) {
    key += '.' + slot_id;
  }
  key += '.' + slot_level;
  return key;
}


// Match functions.
// Match a nonempty string.
var NonEmptyString = Match.Where(function(x) {
  check(x, String);
  return x.trim().length !== 0;
});


// Check (by email address) if a particular user exists.
var userExists = function(user) {
  return Meteor.users.findOne({emails: {$elemMatch: {address: user}}});
}

// For now, limit everyone to 10 characters.
var canCreateMoreCharacters = function(user) {
  return Characters.find({owner: user}).count() <= 10;
}

// Check if a character already has the chosen name.
var characterExists = function(name) {
  return Characters.findOne({name: {$regex: RegExp.quote(name), $options: 'i'}});
}

// Attempt to create a new named character with a given owner.
var createCharacter = function(name, owner) {
  if (!userExists(owner)) {
    throw new Meteor.Error(403, "User '" + owner + "' does not exist");
  }
  if (!canCreateMoreCharacters(owner)) {
    throw new Meteor.Error(403, "User '" + owner + "' can't create additional characters");
  }
  
  // Check the name.
  name = name.trim();
  if (name.length > 100) {
    throw new Meteor.Error(413, "Name too long");
  }
  if (characterExists(name)) {
    throw new Meteor.Error(403, "Character name '" + name + "' already exists");
  }
  
  // Default devotions.
  var devotions = {};
   _.forEach(CharacterDefaults.devotions, function(value, key) {
    devotions[key] = value;
  });
  
  // Default skill checks.
  var skills = {};
  _.forEach(CharacterDefaults.skills, function(value, key) {
    skills[key] = value;
  }); 
  
  // Make a nice default batch of slots.
  var slots = CharacterDefaults.createEmptySlots();
  
  // Put it all together into a map.
  var id = Random.id();
  var character = {
    _id: id,
    name: name,
    level: 1,
    points: {
      skill_points: CharacterDefaults.points.skill_points,
      key_points: CharacterDefaults.points.key_points,
    },
    points_spent: {
      skill_points: 0,
      key_points: 0
    },
    attributes: {
      max_hp: CharacterDefaults.attributes.max_hp,
      max_mana: CharacterDefaults.attributes.max_mana,
      speed: CharacterDefaults.attributes.speed,
      wounds_per_battle: CharacterDefaults.attributes.wounds_per_battle
    },
    devotions: devotions,
    skills: skills,
    slots: slots,
    
    date_created: Date.now(),
    owner: owner
  }
  
  Characters.insert(character);
  return id;
}



// Populate some test data.
Meteor.startup(function() {
  if (!Characters.findOne()) {
    createCharacter('Hackett', 'aj@email.com');
    createCharacter('Grimm', 'jess@email.com');
    createCharacter('Heian', 'dale@email.com');
    createCharacter('Vetis', 'keith@email.com');
    createCharacter('Jazz', 'joe@email.com');
    createCharacter('Celery', 'kevin@email.com');
  }
});

