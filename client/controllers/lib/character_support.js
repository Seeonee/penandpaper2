
CharacterSupport = {};

// Figure out if a character is selected.
CharacterSupport.is_character_selected = function() {
  return Session.get('selected_character');
}

// Get the selected character.
CharacterSupport.selected_character = function(db) {
  return db.findOne({name: Session.get('selected_character')});
}

// Are we trying to edit the character?
CharacterSupport.editing = function() {
  return Session.get('editing_character') != null;
}

// Are we *allowed* to be editing this character?
CharacterSupport.owns = function(character) {
  return (Meteor.userId && Meteor.user().emails[0].address == character.owner);
}

// Get the character's details as a quick summary.
CharacterSupport.details = function(character) {
  var details = '';
  
  // Level.
  var level = 'Level ' + character.level;

  // Heritage.
  var heritage = character.slots.heritage.equipped;
  if (heritage) {
    details += ' ' + CaseUtils.capitalize(heritage);
  }
  
  // Calling.
  var calling = character.slots.heritage.equipped;
  if (calling) {
    details += ' ' + CaseUtils.capitalize(calling);
  }
  if (details.length == 0) {
    details = ' Mystery';
  }
  
  // Wrap it all up.
  return level + details;
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
      name: v.name.toUpperCase(),
      details: CharacterSupport.details(v)
    };
  });
}

