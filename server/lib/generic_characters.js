/*
 * Server-side methods for working with generic characters.
 */

GenericCharacters = {};

// These are the fields that a character database
// should publish to the client.
GenericCharacters.publish_fields = {
  name: 1, 
  level: 1,
  points: 1,
  points_spent: 1,
  attributes: 1,
  devotions: 1,
  skills: 1,
  deity: 1,
  slots: 1,
  
  owner: 1, 
  created: 1,
  last_modified_on: 1
};

// Wrap a database up with some convenience methods.
var wrapper = function(db, entry_name, defaults, admin_only, limit_per_player) {
  this.db = db;
  this.entry_name = entry_name;
  this.defaults = defaults;
  this.admin_only = admin_only;
  if (limit_per_player) {
    this.limit_per_player = limit_per_player;
  }
  
  // See if a user can create more entries in our database.
  this.canPlayerCreateMoreCharacters = function(user) {
    if (this.admin_only && !MyAdmins.isUserLoggedInAsAdmin(user)) {
      return false;
    }
    if (this.limit_per_player) {
      var created = this.db.find({owner: user}).count();
      var result = created <= this.limit_per_player;
      return result;
    }
    return true;
  }
  
  // See if a character name is already in use.
  this.characterExists = function(name) {
    return this.db.findOne({name: {$regex: RegExp.quote(name), $options: 'i'}});
  }
  
  // See if a character can reduce by 1 level.
  this.characterCanLevelDown = function(character) {
    if (character.level <= 1) {
      // Nope, that's our floor.
      return false;
    }
    if (character.points_spent.skill_points == character.points.skill_points) {
      return false;
    }
    return true;
  }
  
  // See if a character can increase by 1 level.
  this.characterCanLevelUp = function(character) {
    if (character.level >= 15) {
      // Nope, that's our ceiling.
      return false;
    }
    return true;
  }
}



// Main (generic) functions for adding/deleting/clicking.

// Attempt to create a new named character with a given owner.
GenericCharacters.createCharacter = function(name, owner, dbWrapper) {
  if (!userExists(owner)) {
    throw new Meteor.Error(403, "User '" + owner + "' does not exist");
  }
  if (!dbWrapper.canPlayerCreateMoreCharacters(owner)) {
    throw new Meteor.Error(403, "User '" + owner + "' can't create additional characters");
  }
  
  // Check the name.
  name = name.trim();
  if (name.length > 100) {
    throw new Meteor.Error(413, "Name too long");
  }
  if (dbWrapper.characterExists(name)) {
    throw new Meteor.Error(403, "Character name '" + name + "' already exists");
  }
  
  // Make a nice default batch of slots.
  var slots = dbWrapper.defaults.createEmptySlots();
  
  // Put it all together into a map.
  var id = Random.id();
  var character = {
    _id: id,
    name: name,
    level: 1,
    points: {
      skill_points: dbWrapper.defaults.points.skill_points,
      key_points: dbWrapper.defaults.points.key_points,
    },
    points_spent: {
      skill_points: 0,
      key_points: 0
    },
    attributes: dbWrapper.defaults.attributes,
    devotions: dbWrapper.defaults.devotions,
    skills: dbWrapper.defaults.skills,
    deity: null,
    slots: slots,
    
    date_created: Date.now(),
    owner: owner
  }
  
  dbWrapper.db.insert(character);
  return id;
}

// Attempt to delete a character, from the perspective of a specific user.
GenericCharacters.deleteCharacter = function(name, owner, dbWrapper) {
  var character = dbWrapper.characterExists(name);
  if (!character) {
    throw new Meteor.Error(403, "Can't delete nonexistant character '" + name + "'");
  }
  if (owner !== character.owner) {
    throw new Meteor.Error(403, "You don't have permission to delete that character");
  }
  
  dbWrapper.db.remove({_id: character._id});
  return name;
}

// Attempt to reduce a character's level by 1.
// This always assumes the currently logged-in user is the culprit.
GenericCharacters.characterLevelDown = function(name, dbWrapper) {
  var character = dbWrapper.characterExists(name);
  if (!character) {
    throw new Meteor.Error(403, "Can't change level of nonexistant character '" + name + "'");
  }
  var user = Meteor.user().emails[0].address;
  if (user !== character.owner) {
    throw new Meteor.Error(403, "You don't have permission to edit that character");
  }

  if (!dbWrapper.characterCanLevelDown(character)) {
    throw new Meteor.Error(403, "That character can't currently lose any more levels");
  }
  
  var new_set = {level: character.level - 1};
  dbWrapper.db.update({_id: character._id}, {$set: new_set});
}

// Attempt to increase a character's level by 1.
// This always assumes the currently logged-in user is the culprit.
GenericCharacters.characterLevelUp = function(name, dbWrapper) {
  var character = dbWrapper.characterExists(name);
  if (!character) {
    throw new Meteor.Error(403, "Can't change level of nonexistant character '" + name + "'");
  }
  var user = Meteor.user().emails[0].address;
  if (user !== character.owner) {
    throw new Meteor.Error(403, "You don't have permission to edit that character");
  }

  if (!dbWrapper.characterCanLevelUp(character)) {
    throw new Meteor.Error(403, "That character can't gain any more levels");
  }
  
  var new_set = {level: character.level + 1};
  dbWrapper.db.update({_id: character._id}, {$set: new_set});
}

// Attempt to set a character's deity.
// This always assumes the currently logged-in user is the culprit.
GenericCharacters.characterSetDeity = function(name, deity, dbWrapper) {
  var character = dbWrapper.characterExists(name);
  if (!character) {
    throw new Meteor.Error(403, "Can't set deity for nonexistant character '" + name + "'");
  }
  var user = Meteor.user().emails[0].address;
  if (user !== character.owner) {
    throw new Meteor.Error(403, "You don't have permission to edit that character");
  }

  if (!_.contains(Deities.all(), deity)) {
    throw new Meteor.Error(403, "That deity doesn't exist");
  }
  
  var new_set = {deity: deity};
  dbWrapper.db.update({_id: character._id}, {$set: new_set});
}

// Attempt to fire a levelbox click for a character name.
// This always assumes the currently logged-in user is the culprit.
GenericCharacters.characterLevelbox = function(
    character_name, 
    slot_name, 
    slot_level, 
    slot_id, 
    clear, 
    dbWrapper) {
  // Check character.
  var character = dbWrapper.characterExists(character_name);
  if (!character) {
    throw new Meteor.Error(403, "Character does not exist");
  }
  var user = Meteor.user().emails[0].address;
  if (user !== character.owner) {
    throw new Meteor.Error(403, "You don't have permission to edit that character");
  }
  
  // Get the slot being modified.
  var edited_slots = _.filter(character.slots, function(v, k) {
    return (k === slot_name);
  });
  if (edited_slots.length > 0) {
    edited_slots = edited_slots[0];
  } else {
    throw new Meteor.Error(403, "Slot does not exist");
  }
  var slot = null;
  if (slot_id) {
    slot_id = slot_id - 1; // Switch to zero-based index.
    if (slot_id >= edited_slots.length) {
      throw new Meteor.Error(403, "Slot does not exist");
    }
    slot = edited_slots[slot_id];
  } else {
    slot = edited_slots;
  }
  
  // Now let's make sure the levelbox exists.
  if (!(slot_level in slot)) {
    throw new Meteor.Error(403, "Levelbox does not exist");
  }
  
  // Okay, just about time to begin doing actual work.
  var skillPointsRemaining = character.points.skill_points - character.points_spent.skill_points;
  var keyPointsRemaining = character.points.key_points - character.points_spent.key_points;
      
  // Get the levelboxes we'll be working with.
  var levelbox = slot[slot_level];
  var previous_levelbox = null;
  if ((slot_level - 1) in slot) {
    previous_levelbox = slot[slot_level - 1];
  }
  var next_levelbox = null;
  if ((slot_level + 1) in slot) {
    next_levelbox = slot[slot_level + 1];
  }
  // Time to make sure someone didn't send us homemade inputs...
  clear = clear || false;
  if (!clear) {
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
        slot_name, 
        slot_id, 
        slot_level,
        dbWrapper);
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
        slot_name, 
        slot_id, 
        slot_level, 
        levelbox.cost,
        dbWrapper);
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
        slot_name, 
        slot_id, 
        slot_level, 
        levelbox.cost,
        dbWrapper);
    } else if (levelbox.lock == 1) {
      // We can't relock it if the previous box is unlocked.
      if (previous_levelbox != null) {
        if (previous_levelbox.lock == 1 && previous_levelbox.unlocked == 1) {
          throw new Meteor.Error(403, "Relock previous slot level first");
        }
      }
      character_do_relock(
        character, 
        slot_name, 
        slot_id, 
        slot_level,
        dbWrapper);
    }
  }
}



// Helper functions.

// Check (by email address) if a particular user exists.
var userExists = function(user) {
  return Meteor.users.findOne({emails: {$elemMatch: {address: user}}});
}



// Levelbox helper functions.

// Fill in a slot. This assumes error checking's been done.
// slot_id may be null.
var character_do_fill = function(character, slot_name, slot_id, slot_level, cost, dbWrapper) {
  var new_set = {};
  new_set[create_key(slot_name, slot_id, slot_level) + '.filled'] = 1;
  new_set['points_spent.skill_points'] = character.points_spent.skill_points + cost;
  dbWrapper.db.update({ _id: character._id}, { $set: new_set});
}

// Clear a slot. This assumes error checking's been done.
// slot_id may be null.
var character_do_clear = function(character, slot_name, slot_id, slot_level, cost, dbWrapper) {
  var new_set = {};
  new_set[create_key(slot_name, slot_id, slot_level) + '.filled'] = 0;
  new_set['points_spent.skill_points'] = character.points_spent.skill_points - cost;
  dbWrapper.db.update({ _id: character._id}, { $set: new_set});
}

// Unlock a slot. This assumes error checking's been done.
// slot_id may be null.
var character_do_unlock = function(character, slot_name, slot_id, slot_level, dbWrapper) {
  var new_set = {};
  new_set[create_key(slot_name, slot_id, slot_level) + '.unlocked'] = 1;
  new_set['points_spent.key_points'] = character.points_spent.key_points + 1;
  dbWrapper.db.update({ _id: character._id}, { $set: new_set});
}

// Relock a slot. This assumes error checking's been done.
// slot_id may be null.
var character_do_relock = function(character, slot_name, slot_id, slot_level, dbWrapper) {
  var new_set = {};
  new_set[create_key(slot_name, slot_id, slot_level) + '.unlocked'] = 0;
  new_set['points_spent.key_points'] = character.points_spent.key_points - 1;
  dbWrapper.db.update({ _id: character._id}, { $set: new_set});
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




// This object wraps access to the database of player characters.
GenericCharacters.Characters = new wrapper(
  Characters, 
  'character', 
  CharacterDefaults,
  false, 
  10);

// This object wraps access to the database of non-player characters.
/* !!! TODO: Uncomment once the Monsters collection exists...
GenericCharacters.Characters = new wrapper(
  Monsters, 
  'monster', 
  MonsterDefaults,
  true);
*/

