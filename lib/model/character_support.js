
CharacterSupport = {};

// Figure out if a character is selected.
CharacterSupport.is_character_selected = function() {
  return Session.get('selected_character');
}

// Get the selected character.
CharacterSupport.selected_character = function(db) {
  var character = db.findOne({name: Session.get('selected_character')});
  if (character) {
    character = CharacterSupport.withBonuses(character);
  }
  return character;
}

// Are we trying to edit the character?
CharacterSupport.editing = function() {
  return Session.get('editing_character') != null;
}

// Are we *allowed* to be editing this character?
CharacterSupport.owns = function(character) {
  return (Meteor.userId() != null && Meteor.user().emails[0].address == character.owner);
}

// Get the character's details as a quick summary.
CharacterSupport.details = function(character) {
  var details = '';
  
  // Level.
  var level = 'Level ' + character.level;

  // Heritage.
  var heritage = character.slots.heritage.equipped;
  if (heritage) {
    heritage = Codex.findOne({_id: heritage});
    if (heritage) {
      var name = heritage.name.toLowerCase().split(/\s+/g);
      name = _.map(name, function(v) {
        return CaseUtils.capitalize(v);
      }).join(' ');
      details += ' ' + name;
    }
  }
  
  // Calling.
  var calling = character.slots.calling.equipped;
  if (calling) {
    calling = Codex.findOne({_id: calling});
    if (calling) {
      var name = calling.name.toLowerCase().split(/\s+/g);
      name = _.map(name, function(v) {
        return CaseUtils.capitalize(v);
      }).join(' ');
      details += ' ' + name;
    }
  }
  if (details.length == 0) {
    details = ' Mystery';
  }
  
  // Wrap it all up.
  return level + details;
}

// Returns a map that still works as a character,
// but has its stats adjusted based on equipped slots.
CharacterSupport.withBonuses = function(character) {
  var c = _.extend({}, character);
  _.each(c.slots, function(value, key) {
    if ('equipped' in value) {
      update(c, value);
    } else {
      _.each(value, function(v) {
        update(c, v);
      });
    }
  });
  return c;
}

// Update a character based on a particular slot.
var update = function(character, slot) {
  if (slot.equipped) {
    var skill = Codex.findOne({_id: slot.equipped});
    if (skill) {
      var formatted_bonuses = {};
      _.each(skill.bonuses, function(v) {
        var pieces = v.trim().split(/\s+/);
        if (pieces.length == 2) {
          var value = parseInt(pieces[0]);
          var name = pieces[1].trim();
          formatted_bonuses[name] = value;
        }
      });
      var mods = {};
      _.each(formatted_bonuses, function(value, name) {
        try {
          var pieces = name.split(/\./g);
          recursively_update(character, pieces, value);
        } catch (err) {
          // Pass.
        }
      });
    }
  }
}

// Pop the first piece, access that member of the object, and continue.
var recursively_update = function(obj, pieces, value) {
  if (pieces.length <= 0) {
    // Uh oh.
    return;
  }
  var attribute = pieces.shift();
  if (pieces.length == 0) {
    obj[attribute] = obj[attribute] + value;
  } else {
    recursively_update(obj[attribute], pieces, value);
  }
}


// Get the remaining skill points.
CharacterSupport.skill_points_remaining = function(character) {
  return character.points.skill_points - character.points_spent.skill_points;
}

// Get the remaining key points.
CharacterSupport.key_points_remaining = function(character) {
  return character.points.key_points - character.points_spent.key_points;
}

// Get the available deities, including which one's selected.
CharacterSupport.selectable_deities = function(character) {
  var result = _.map(Deities.all(), function(v) {
    return {
      name: v,
      name_pretty: CaseUtils.capitalize(v),
      selected: (character.deity === v) ? 'selected' : ''
    };
  })
  result.unshift({
    name: '',
    name_pretty: '',
    selected: ''
  });
  return result;
}

// Get the character's skill and key points.
CharacterSupport.points = function(character) {
  var points_spent = character.points_spent;
  return _.map(character.points, function(value, key) {
    var adjusted_value = value - points_spent[key];
    key = PenAndPaperUtils.deunderscore(key);
    return {name: key, value: adjusted_value};
  });
}

// Get the character's attributes.
CharacterSupport.attributes = function(character) {
  return _.map(character.attributes, function(value, key) {
    key = PenAndPaperUtils.deunderscore(key);
    // Handle special capitalization on "HP".
    if (key.slice(-2) === 'hp') {
      key = key.slice(0, -2) + 'HP';
    }
    return {name: key, value: value};
  });
}

// Get the character's skills (for making skill checks).
CharacterSupport.skills = function(character) {
  var results = [];
  _.each(character.skills, function(value, key) {
    key = PenAndPaperUtils.deunderscore(key);
    _.each(value, function(v, k) {
      results.push({
        name: key + ' (' + k + ')',
        value: v
      });
    });
  });
  return results;
}

// Is this character devoted to any gods?
CharacterSupport.is_devoted = function(character) {
  var total_devotion = _.reduce(character.devotions, function(total, value) {
    return total + Math.abs(value);
  }, 0);
  return total_devotion != 0;
}

// Get the character's nonzero devotions.
CharacterSupport.devotions = function(character) {
  var devotions = character.devotions;
  // "Any" goes to the deity of choice.
  if (character.deity != null && character.deity in devotions) {
    devotions[character.deity] += devotions.any;
    devotions.any = 0;
  }
  
  var all_devotions = _.map(devotions, function(value, key) {
    key = PenAndPaperUtils.deunderscore(key);
    return {name: key, value: value};
  })
  // Keep only the interesting ones.
  return _.filter(all_devotions, function(entry) {
    return entry.value != 0
  });
}

// Looks up what level a character has filled in for a given slot.
// The param is {name: name, id: id}.
CharacterSupport.get_slot_level = function(character, slot) {
  try {
    var name = slot.name.trim();
    var selected_slot = character.slots[name];
    if (slot.id) {
      selected_slot = selected_slot[slot.id - 1];
    }
    // Tally the levelboxes that are filled in.
    return CharacterSupport.get_slot_level_inner(selected_slot);
  } catch (err) {
    return 0;
  }
}

// Looks up what level a character has filled in for a given slot.
// The param is {name: name, id: id}.
CharacterSupport.get_slot_level_inner = function(slot) {
  try {
    // Tally the levelboxes that are filled in.
    var defaults = 0;
    var tally = _.reduce(slot, function(sum, levelbox, key) {
      if (key != parseInt(key)) {
        return sum;
      }
      if (levelbox.learned_by_default == 1) {
        defaults += 1;
      }
      return sum + levelbox.filled;
    }, 0);
    if (tally > 0) {
      tally += defaults;
    }
    return tally;
  } catch (err) {
    return 0;
  }
}



// These next ones help out on the "characters" page.

// Get a list of all unique owners.
CharacterSupport.get_owners = function(db) {
  var owners = {};
  // TODO: First sort by last_modified_on or level? !!!
  db.find({}, {sort: {owner: 1, name: 1}}).forEach(function(character) {
    var owner = character.owner;
    if (!(owner in owners)) {
      owners[owner] = {
        name: owner,
        characters: []
      };
    }
    owners[owner].characters.push(character);
  });
  return _.map(owners, function(owner) {
    return owner;
  });
}


// These help out on the "home" page.
CharacterSupport.characters_from_db_owned_by = function(db, owner) {
  return db.find({owner: owner}, {sort: {last_modified_on: -1, name: -1}}).map(function(v) {
    return {
      name: v.name,
      name_pretty: v.name.toUpperCase(),
      details: CharacterSupport.details(v)
    };
  });
}

