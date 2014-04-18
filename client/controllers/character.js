
// Figure out if a character is selected.
Template.character.is_character_selected = function() {
  return Session.get('selected_character');
}

// Get the selected character.
Template.character.selected_character = function() {
  return Characters.findOne({name: Session.get('selected_character')});
}

// Get the character's details as a quick summary.
Template.character.details = function() {
  var details = '';
  
  // Level.
  var level = 'Level ' + this.level;

  // Heritage.
  var heritage = null;
  // TODO: Try to find out the heritage here.
  if (heritage) {
    details += ' ' + heritage;
  }
  
  // Calling.
  var calling = null;
  // TODO: Try to find out the calling here.
  if (calling) {
    details += ' ' + calling;
  }
  if (details.length == 0) {
    details = ' Mystery';
  }
  
  // Wrap it all up.
  return level + details;
}

// Get the character's skill and key points.
Template.character_points.points = function() {
  return _.map(this.points, function(value, key) {
    key = PenAndPaperUtils.deunderscore(key);
    return {name: key, value: value};
  });
}

// Get the character's attributes.
Template.character_attributes.attributes = function() {
  return _.map(this.attributes, function(value, key) {
    key = PenAndPaperUtils.deunderscore(key);
    // Handle special capitalization on "HP".
    if (key.slice(-2) === 'hp') {
      key = key.slice(0, -2) + 'HP';
    }
    return {name: key, value: value};
  });
}

// Get the character's skills (for making skill checks).
Template.character_skills.skills = function() {
  var results = [];
  _.each(this.skills, function(value, key) {
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
Template.character_devotions.is_devoted = function() {
  var total_devotion = _.reduce(this.devotions, function(total, value) {
    return total + value;
  }, 0);
  return total_devotion != 0;
}

// Get the character's nonzero devotions.
Template.character_devotions.devotions = function() {
  var all_devotions = _.map(this.devotions, function(value, key) {
    key = PenAndPaperUtils.deunderscore(key);
    return {name: key, value: value};
  })
  // Keep only the interesting ones.
  return _.filter(all_devotions, function(entry) {
    return entry.value != 0
  });
}

