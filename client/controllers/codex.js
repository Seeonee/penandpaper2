
// Get the list of all codex entries.
Template.codex.codex = function() {
  return Codex.find(getSelectedCodexFilterTerms(), {sort: {name: -1}});
}

// Format a codice's name for display.
Template.codex_entry.name_uppercase = function() {
  return this.name.toUpperCase();
}

// Format a codice's slot, for icon purposes.
Template.codex_entry.first_slot = function() {
  return this.slots[0].replace(/_/g, ' ');
}

// Format a codice's slot(s) for display.
Template.codex_entry.slots_list = function() {
  return PenAndPaperUtils.multi_deunderscore(this.slots);
}

// Format a codice's type(s) for display.
Template.codex_entry.types_list = function() {
  return PenAndPaperUtils.multi_deunderscore(this.types);
}

// Format a codice's text for display.
Template.codex_entry.text_with_breaks = function() {
  return this.text.replace(/\\n|\n/g, '<br />');
}

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

// Open a dialog to create a new codex entry.
Template.codex.events({
  'click .dialog_open_button': function() {
    var codice = {
      name: 'NAME',
      level: '1',
      slots: 'Slot',
      types: 'Types',
      text: 'Description...'
    };
    Session.set('new_codice', codice);
  }
});

// Open a dialog to create a new codex entry,
// using an existing entry as a template.
Template.codex_entry.events({
  'click .name': function() {
    var codice = {
      name: PenAndPaperUtils.deunderscore(this.name),
      level: this.level,
      slots: PenAndPaperUtils.multi_deunderscore(this.slots),
      types: PenAndPaperUtils.multi_deunderscore(this.types),
      text: this.text
    };
    Session.set('new_codice', codice)
  }
});

