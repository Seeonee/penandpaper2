
// See if we can find a single codice.
Template.codice.codice_exists = function(name) {
  return Codex.findOne({name: name});
}

// Return the codice as an iterable (single) item.
Template.codice.entry_for = function(name) {
  return Codex.findOne({name: name});
}

// Figure out if a character is selected.
Template.codice.is_codice_selected = function() {
  return Session.get('selected_codice');
}

// Get the selected character.
Template.codice.selected_codice = function() {
  return Codex.findOne({name: Session.get('selected_codice')});
}

