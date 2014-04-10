/**
 * Character model.
 */
Meteor.subscribe("characters");

// Get the list of all characters for this user.
Template.characters.characters = function() {
  return Characters.find({}, {sort: {owner: -1, created: -1}});
}

// Get formatted dates.
var formatDate = function(epoch) {
  return new Date(epoch);
}

Template.characters.date_created = function() {
  return formatDate(this.created);
}

Template.characters.date_modified = function() {
  return formatDate(this.modified);
}

// Format a character's skill list.
// TODO: Move to a method on the character model.
Template.characters.skills_list = function() {
  return this.skills.join(', ');
}

// Figure out if the user has any characters.
Template.characters.characters_exist = function() {
  return Characters.findOne();
}

// Get the message to display when no characters are found.
Template.characters.no_characters = function() {
  return 'No one\'s created any characters yet.';
}

// Figure out if a character is selected.
Template.character.is_character_selected = function() {
  return Session.get('selected_character');
}

// Get the selected character.
Template.character.selected_character = function() {
  return Characters.findOne({name: Session.get('selected_character')});
}

// Get the logged-in user's email address.
var getOwner = function() {
  var user = Meteor.user();
  if (user) {
    return user.emails[0].address;
  }
  return null;
}

