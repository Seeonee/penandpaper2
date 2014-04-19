/**
 * Character model.
 */
Meteor.subscribe("characters");

// Get a list of all unique owners.
Template.characters.get_owners = function() {
  var owners = {};
  // TODO: First sort by last_modified_on or level? !!!
  Characters.find({}, {sort: {owner: 1, name: 1}}).forEach(function(character) {
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

// Date a character was created.
Template.characters.date_created = function() {
  return PenAndPaperUtils.formatDate(this.created);
}

// Date a character was last modified.
Template.characters.date_modified = function() {
  return PenAndPaperUtils.formatDate(this.modified);
}

// Figure out if the user has any characters.
Template.characters.characters_exist = function() {
  return Characters.findOne();
}

// Get the message to display when no characters are found.
Template.characters.no_characters = function() {
  return 'No one\'s created any characters yet.';
}

