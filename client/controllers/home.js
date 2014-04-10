// Get the list of all characters for this user.
Template.home.characters = function() {
  return Characters.find({owner: getOwner()}, {sort: {modified: -1, name: -1}});
}

// Format a character's skill list.
// TODO: Move to a method on the character model.
Template.home.skills_list = function() {
  return this.skills.join(', ');
}

// Figure out if the user has any characters.
Template.home.has_characters = function() {
  return Characters.findOne({owner: getOwner()});
}

// Get the message to display when no characters are found.
Template.home.no_characters = function() {
  var user = Meteor.user();
  if (user) {
    return 'You haven\'t created any characters yet.';
  } else {
    return 'Log in to create characters.';
  }
}

// Get the logged-in user's email address.
var getOwner = function() {
  var user = Meteor.user();
  if (user) {
    return user.emails[0].address;
  }
  return null;
}

