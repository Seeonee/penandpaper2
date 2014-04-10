/**
 * Codex model.
 */
Meteor.subscribe("codex");

// Initial filters.
Session.set('selected_filters', {
  name: '',
  text: '',
  types: '',
  level: '',
  slots: '',
});

// Get the list of all codex entries.
Template.codex.codex = function() {
  // Add in the filters.
  var filters = Session.get('selected_filters');
  var find_terms = {};
  if (filters) {
    // These values expect string arrays; 
    // we have to match all elements.
    $.each(['slots', 'types'], function(k, v) {
      if (filters[v]) {
        find_terms[v] = {$all: filters[v]};
      }
    });
    // This should be an int.
    if (filters['level']) {
      find_terms['level'] = parseInt(filters['level'][0]);
    }
    // This should match a string regex.
    if (filters['name']) {
      find_terms['name'] = {
        $regex: RegExp.quote(filters['name']),
        $options: 'i'
      };
    }
    // This should match any text.
    // TODO: ! But for now, use a string regex.
    if (filters['text']) {
      // %20 has been converted to spaces,
      // but + has been converted to _,
      // which we also want to change into spaces.
      var text = filters['text'][0].replace(/_/g, ' ');
      find_terms['text'] = {
        $regex: RegExp.quote(text),
        $options: 'i'
      };
    }
  }
  return Codex.find(find_terms, {sort: {name: -1}});
}

// Format a codice's name.
Template.codex_entry.name_uppercase = function() {
  return this.name.toUpperCase();
}

// Format a codice's slot(s).
Template.codex_entry.slots_list = function() {
  return PenAndPaperUtils.multi_deunderscore(this.slots);
}

// Format a codice's type(s).
Template.codex_entry.types_list = function() {
  return PenAndPaperUtils.multi_deunderscore(this.types);
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

// Loop over the filters.
Template.codex_filters.get_text_filters = function() {
  var filters = _.map(Session.get('selected_filters'), function(value, key) {
    return {
      name: key, 
      name_pretty: key[0].toUpperCase() + key.slice(1),
      value: value
    };
  });
  // Don't add the slot filter yet.
  filters = _.filter(filters, function(f) { return f.name != 'slots' });
  return filters;
}

// Get the slot filter.  
Template.codex_filters.get_slot_filter = function() {
  var filter = Session.get('selected_filters');
  if (filter && filter['slots']) {
    filter = filter['slots'][0];
  } else {
    filter = '';
  }
  return {
    name: 'slots',
    name_pretty: 'Slots',
    value: filter
  };
}

// Get the possible values.
Template.codex_filters.get_slot_values = function() {
  var values = [
    'ability',
    'ability upgrade',
    'armor',
    'armor upgrade',
    'calling',
    'curse',
    'gift',
    'heritage',
    'one handed shield',
    'one handed shield upgrade',
    'one handed weapon',
    'one handed weapon upgrade',
    'two handed ranged weapon',
    'two handed ranged weapon upgrade'
  ];
  var filter = Session.get('selected_filters');
  if (filter && filter['slots']) {
    filter = filter['slots'][0].replace(/_/g, ' ');
  }
  var map = _.map(values, function(value, key) {
    return {
      name: value,
      name_pretty: value[0].toUpperCase() + value.slice(1),
      selected: (value == filter) ? 'selected' : ''
    }
  });
  map.unshift({name: '', name_pretty: '', selected: ''});
  return map;
}

// Create nicely formatted URL additions.
var formatForURL = function(filter, text) {
  var s = text.trim().toLowerCase();
  if (filter == 'types') {
    var s = s.replace(/ +/g, '+');
    s = s.replace(/[,\+]{2,}/g, '&');
    return filter + ':' + s;
  }
  return filter + ':' + s.replace(/ /g, '+');
}

// Collate search terms and start looking.
var performSearch = function() {
  var url = '';
  $.each(['name', 'types', 'level', 'text', 'slots'], function(k, v) {
    var text = $('.search_inputs [name="query_' + v + '"]').val();
    if (text && text != '') {
      url += '/' + formatForURL(v, text);
    }
  });
  if (url != '') {
    // TODO: If a character is selected and
    // skills are being search as part of equipping
    // one of that character's slots, the base path
    // should be something more like:
    // "/characters/<name>/<slot_name>/<#>/<url...>"
    Router.go('/codex' + url);
  }
}

// Handle search inputs.
Template.codex_filters.events = {
  'keydown .text': function(evt) {
    if (evt.which == 13) {
      performSearch();
    }
  },
  'click .submit_button': performSearch
}

