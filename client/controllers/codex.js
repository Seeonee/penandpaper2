
// If we're choosing slots for a character, show it.
Template.codex.character_being_edited = function() {
  var name = null;
  if (Session.get('editing_character') != null) {
    var name = Session.get('selected_character');
  }
  if (name != null) {
    var slot = Session.get('editing_slot');
    var slot_name = 'Unknown slot';
    if (SlotsUtils.isValidSlot(slot)) {
      var level = CharacterSupport.get_slot_level(Characters.findOne({name: name}), slot);
      slot_name = PenAndPaperUtils.deunderscore(slot.name);
      if (slot.id != null) {
        slot_name += ' (#' + slot.id + ')';
      }
    }
    return {
      editing: true,
      name: name,
      name_pretty: name.toUpperCase(),
      slot_pretty: slot_name,
      level_pretty: 'Level ' + level + ' slot'
    };
  } else {
    return {
      editing: false
    }
  }
}

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
      text: 'Description...',
      bonuses: ''
    };
    Session.set('new_codice', codice);
  }
});

// Format a codice's name for display.
Template.codex_entry.name_uppercase = function() {
  return this.name.toUpperCase();
}

// This tells us whether or not we're currently browsing
// to fill a character's slot.
Template.codex_entry.equippable = function() {
  return (Session.get('editing_slot') != null) ? 'clickable' : '';
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

// Format a codice's type(s) for display.
Template.codex_entry.bonuses_list = function() {
  return this.bonuses.join(', ');
}

// Format a codice's text for display.
Template.codex_entry.text_with_breaks = function() {
  return _.escape(this.text).replace(/\\n|\n/g, '<br />');
}

// Lite test for admin privileges.
var can_edit = function() {
  return Session.get('editing_slot') == null && MyAdmins.isUserLoggedInAsAdmin();
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
      text: this.text,
      bonuses: this.bonuses.join(', ')
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
      text: $(template.find(".info .text .value")).html(), // Because we allow newlines.
      bonuses: $(template.find(".info .bonuses .value")).text()
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
  },
  // Select a skill.
  'click .document': function(evt, template) {
    if (Session.get('editing_character')) {
      var name = Session.get('selected_character');
      if (name) {
        var options = {
          character_name: name,
          slot_name: Router.current().params.slot_name,
          skill_id: template.data._id
        };
        var slot_id = parseInt(Router.current().params.slot_id);
        if (slot_id) {
          options.slot_id = slot_id;
        }
        Meteor.call('characterEquipSlot', options, function(err, result) {
          if (err) {
            console.log(err);
          } else {
            // Return to the character edit page.
            var route = Router.current().route.name; // Here's where we are now.
            var params = {
              name: Router.current().params.name,
              edit: 'edit'
            };
            Router.go(route.replace('_edit_slot', ''), params);
          }
        });
      }
    }
  }
});


