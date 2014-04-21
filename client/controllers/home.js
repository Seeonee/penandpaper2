
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

// Button for deleting a character.
Template.character_tile.events({
  'click .delete': function() {
    if (confirm('Are you sure you want to delete "' + this.name + '"?')) {
      Meteor.call('deleteCharacter', {name: this.name});
    }
  }
});

// Open a dialog to create a new character.
Template.new_character_tile.events({
  'click .new': function() {
    var character = {
      name: ''
    };
    Session.set('new_character', character);
  }
});
