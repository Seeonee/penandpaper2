
// Is the dialog visible?
Template.new_codex_dialog.isVisible = function() {
  return Session.get('new_codice');
}

// The object representing the newly forming codice.
Template.new_codex_dialog.codice_being_created = function() {
  return Session.get('new_codice');
}

// Register click events.
Template.new_codex_dialog.events({
  // Close the dialog.
  'click .dialog_cancel_button': function() {
    Session.set('new_codice', null);
  },
  // Assemble and (attempt to) submit the new entry.
  // If it works, the dialog will close.
  // If not, an error message will be displayed (TODO!!!).
  'click .dialog_submit_button': function (event, template) {
    var name = template.find("input[name*=new_codex_name]").value;
    var level = template.find("input[name*=new_codex_level]").value;
    var slots = template.find("input[name*=new_codex_slots]").value;
    var types = template.find("input[name*=new_codex_types]").value;
    var text = template.find("textarea[name*=new_codex_text]").value;

    var callback = function(err, result) {
      if (err) {
        console.log('error: ' + err);
        Session.set('new_codice', _.extend(Session.get('new_codice'), {error: err.toString()}));
      } else {
        console.log('success; new entry id: ' + result);
        Session.set('new_codice', null);
      }
    }
    options = {
      name: name,
      level: level,
      slots: slots,
      types: types,
      text: text
    };
    createCodice(options, callback);
  }
});

