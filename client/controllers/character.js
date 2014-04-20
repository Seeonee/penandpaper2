
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

