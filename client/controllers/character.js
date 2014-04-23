
// Figure out if a character is selected.
Template.character.is_character_selected = CharacterSupport.is_character_selected;

// Get the selected character.
Template.character.selected_character = function() {
  return CharacterSupport.selected_character(Characters);
}

// Are we trying to edit the character?
Template.character.editing = CharacterSupport.editing;
Template.character_nav.editing = CharacterSupport.editing;

// Are we *allowed* to be editing this character?
Template.character.owns = function() {
  return CharacterSupport.owns(this);
}
Template.character_summary.owns = function() {
  return CharacterSupport.owns(this);
}

// Get the character's details as a quick summary.
Template.character.details = function() {
  return CharacterSupport.details(this);
}

// Get the remaining skill points.
Template.character_nav.skill_points_remaining = function() {
  return CharacterSupport.skill_points_remaining(this);
}

// Get the remaining key points.
Template.character_nav.key_points_remaining = function() {
  return CharacterSupport.key_points_remaining(this);
}

// Can this character level up?
Template.character_controls.can_level_up = function() {
  return ((this.level + 1) in CharacterSchema) ? 'available' : '';
}

// Can this character level up?
Template.character_controls.can_level_down = function() {
  if (this.level <= 1) {
    return false;
  }
  var remaining = {
    skill_points: this.points.skill_points - this.points_spent.skill_points,
    key_points: this.points.key_points - this.points_spent.key_points
  }
  var sufficient = true;
  _.each(CharacterSchema[this.level], function(v, k) {
    if (remaining[k] < v) {
      sufficient = false;
    }
  });
  return (sufficient) ? 'available' : '';
}

// Get the available deities.
Template.character_controls.selectable_deities = function() {
  return CharacterSupport.selectable_deities(this);
}

// Click events for the various controls.
Template.character_controls.events({
  'click .level_down.available': function() {
    var options = {
      character_name: Session.get('selected_character')
    };
    Meteor.call('characterLevelDown', options, function(err, result) {
      if (err) {
        console.log(err);
      }
    });
  },
  'click .level_up.available': function() {
    var options = {
      character_name: Session.get('selected_character')
    };
    Meteor.call('characterLevelUp', options, function(err, result) {
      if (err) {
        console.log(err);
      }
    });
  },
  'change [name*="set_deity"]': function(evt) {
    var deity = $(evt.target).val();
    var options = {
      character_name: Session.get('selected_character'),
      deity: deity
    };
    Meteor.call('characterSetDeity', options, function(err, result) {
      if (err) {
        console.log(err);
      }
    });
  },
});

// Get the character's skill and key points.
Template.character_points.points = function() {
  return CharacterSupport.points(this);
}

// Get the character's attributes.
Template.character_attributes.attributes = function() {
  return CharacterSupport.attributes(this);
}

// Get the character's skills (for making skill checks).
Template.character_skills.skills = function() {
  return CharacterSupport.skills(this);
}

// Is this character devoted to any gods?
Template.character_devotions.is_devoted = function() {
  return CharacterSupport.is_devoted(this);
}

// Get the character's nonzero devotions.
Template.character_devotions.devotions = function() {
  return CharacterSupport.devotions(this);
}

// Get the character's skills.
Template.character_equipped_skills.equipped_skills = function() {
  return CharacterSupport.equipped_skills(this);
}

