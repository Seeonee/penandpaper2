
// Is the dialog visible?
Template.new_character_dialog.isVisible = function() {
  return Session.get('new_character');
}

// The object representing the newly forming codice.
Template.new_character_dialog.character_being_created = function() {
  return Session.get('new_character');
}

// This is fired whenever our "add" attempt finishes
// or fails.
var newCharacterCallback = function(err, result) {
  if (err) {
    console.log('error: ' + err);
    Session.set('new_character', _.extend(Session.get('new_character'), {
      error: ErrorUtils.extract(err.toString())
    }));
  } else {
    console.log('success; new character id: ' + result);
    Session.set('new_character', null);
    var name = Characters.findOne({_id: result}).name;
    Router.go('character', {name: name});
  }
}

// Submit function.
var submit = function (event, template) {
  options = {
    name: template.find("input[name*=new_character_name]").value
  };
  Meteor.call('createCharacter', options, newCharacterCallback);
}

// Register click events.
Template.new_character_dialog.events({
  // Close the dialog.
  'click .dialog_cancel_button': function() {
    Session.set('new_character', null);
  },
  // Assemble and (attempt to) submit the new entry.
  // If it works, the dialog will close.
  // If not, an error message will be displayed.
  'click .dialog_submit_button': submit,
  'keypress input[name*=new_character_name]': function(event, template) {
    if (event.which == 13) {
      submit(event, template);
    }
  }
});

