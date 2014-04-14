/**
 * Codex model.
 */
Meteor.subscribe("codex");

// Initial filters.
Session.set('selected_filters', null);

// Get the list of all codex entries.
Template.codex.codex = function() {
  // Add in the filters.
  var find_terms = {};
  var filters = Session.get('selected_filters');
  if (filters) {
    $.each(filters, function(filter_name, filter_value) {
      var filter = FilterUtils.get_filter_by_name(filter_name);
      if (filter) {
        find_terms[filter_name] = filter.dataToSearchTermConverter(filter_value);
      }
    });
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

// Return the list of filters available.
Template.codex_filters.get_filters = function() {
  var all_filters = FilterUtils.get_all_filters();
  var selected_filters = Session.get('selected_filters');
  return $.map(all_filters, function(filter) {
    var value = '';
    if (selected_filters && selected_filters[filter.name]) {
      value = selected_filters[filter.name];
    }
    FilterUtils.update_filter_value(filter, value);
    return filter;
  });
}

// Collate search terms and start looking.
var performSearch = function() {
  var url = '';
  $.each(FilterUtils.get_all_filter_names(), function(k, filter_name) {
    var elem = $('.search_inputs [name="query_' + filter_name + '"]');
    if (elem) {
      text = elem.val();
      if (text && text != '') {
        url += FilterUtils.format_value_for_url(filter_name, text);
      }
    }
  });
  
  // TODO: If a character is selected and
  // skills are being search as part of equipping
  // one of that character's slots, the base path
  // should be something more like:
  // "/characters/<name>/<slot_name>/<#>/<url...>"
  Router.go('/codex' + url);
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

