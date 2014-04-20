
// Get the logged-in user's email address.
var get_user = function() {
  var user = Meteor.user();
  if (user) {
    return user.emails[0].address;
  }
  return null;
}

// Use this to tell if we're logged in.
Template.home.get_user = get_user;
Template.user_home.get_user = get_user;

// Figure out if the user has any characters.
Template.user_home.has_characters = function() {
  return Characters.findOne({owner: get_user()});
}

// Get the list of all characters for this user.
Template.user_home.characters = function() {
  return CharacterSupport.characters_from_db_owned_by(Characters, get_user());
}

