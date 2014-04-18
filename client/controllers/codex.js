
// Get the list of all codex entries.
Template.codex.codex = function() {
  return Codex.find(getSelectedCodexFilterTerms(), {sort: {name: 1}});
}

// Open a dialog to create a new codex entry.
Template.codex.events({
  'click .add_more': function() {
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

// Format a codice's name for display.
Template.codex_entry.name_uppercase = function() {
  return this.name.toUpperCase();
}

// Format a codice's slot, for icon purposes.
Template.codex_entry.first_slot = function() {
  return this.slots[0].replace('_upgrade', ' upgrade');
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
  return _.escape(this.text).replace(/\\n|\n/g, '<br />');
}

// Lite test for admin privileges.
var can_edit = function() {
  return PenAndPaperUtils.isUserAdmin();
}

// Attach it to various templates.
Template.codex.can_edit = can_edit;
Template.codex_entry.can_edit = can_edit;

// This is fired whenever our "delete" attempt finishes
// or fails.
var logErrorCallback = function(err, result) {
  if (err) {
    console.log('error: ' + err);
  }
}

// Figure out if this editable element can accept newlines.
// I.e., is it the text area?
var isNewlineAllowedInElement = function(element) {
  try {
    return element.parent().hasClass('text');
  } catch (err) {
    // Oh well, no newlines for you.
    return false;
  }
}

// Open a dialog to create a new codex entry,
// using an existing entry as a template.
Template.codex_entry.events({
  'keypress [contenteditable="true"]': function(evt) {
    if (evt.which == 13) {
      var element = $(event.target);
      if (!isNewlineAllowedInElement(element)) {
        evt.preventDefault();
      }
    }
  },
  // Create a new entry based on this one.
  'click .button.copy': function() {
    var codice = {
      name: PenAndPaperUtils.deunderscore(this.name),
      level: this.level,
      slots: PenAndPaperUtils.multi_deunderscore(this.slots),
      types: PenAndPaperUtils.multi_deunderscore(this.types),
      text: this.text
    };
    Session.set('new_codice', codice)
  },
  // Attempt to delete an entry.
  'click .button.delete': function() {
    if (confirm('Are you sure you want to delete "' + this.name + '"?')) {
      deleteCodice({_id: this._id}, logErrorCallback);
    }
  },
  // Save modifications to an entry.
  'click .button.save': function(evt, template) {
    options = {
      _id: this._id,
      name: $(template.find(".icon .name")).text(),
      level: $(template.find(".info .level .value")).text(),
      slots: $(template.find(".info .slot .value")).text(),
      types: $(template.find(".info .type .value")).text(),
      text: $(template.find(".info .text .value")).html() // Because we allow newlines.
    };
    // Fix up the newlines in text... *sigh*
    options.text = options.text.replace(/<br.*?>/gi, '\n');
    // If we don't do this next bit, the value in the <div>
    // doesn't match what comes back from the database, and
    // for some reason we end up with the last line or two 
    // getting duplicated (each time we save, so potentially
    // a lot).
    $(template.find(".info .text .value")).html(options.text.replace(/\n/g, '<br>'));
    
    // Okay, now we can do real work.
    updateCodice(options, logErrorCallback);
  }
});


