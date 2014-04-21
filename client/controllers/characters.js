/**
 * Character model.
 */
Meteor.subscribe("characters");

// Get a list of all unique owners.
Template.characters.get_owners = function() {
  return CharacterSupport.get_owners(Characters);
}

// Date a character was created.
Template.characters.date_created = function() {
  return PenAndPaperUtils.formatDate(this.created);
}

// Date a character was last modified.
Template.characters.date_modified = function() {
  return PenAndPaperUtils.formatDate(this.last_modified_on);
}

// Figure out if the user has any characters.
Template.characters.characters_exist = function() {
  return Characters.findOne();
}


