
// This will track what filters can be applied.
CodexFilters = FilterUtils.make();

// Initialize a bunch of filter stuff.
var initialize_filters = function() {
  CodexFilters.add_text_filter(
    'name', 
    FilterUtils.regex_match
  );
  CodexFilters.add_text_filter(
    'types', 
    FilterUtils.all_in_list_match, 
    FilterUtils.as_list_data_to_url_converter
  );
  CodexFilters.add_text_filter(
    'text', 
    FilterUtils.regex_match
  );
  CodexFilters.add_text_filter(
    'level', 
    FilterUtils.int_match
  );
  
  // This one's special.
  var choices = _.map(SlotsUtils.all(), function(v, k) {
    return k;
  });
  choices.unshift('');
  CodexFilters.add_multiple_choice_filter(
    'slots', 
    choices, 
    FilterUtils.all_in_list_match,
    FilterUtils.space_to_underscore_data_to_url_converter
  );
}

// Fire it.
initialize_filters();

// Initial the selected filter(s).
Session.set('selected_filters', null);

// Take the selected filters and return a map of terms that 
// can be used in a Mongo find() call.
getSelectedCodexFilterTerms = function() {
  var find_terms = {};
  var filters = Session.get('selected_filters');
  if (filters) {
    $.each(filters, function(filter_name, filter_value) {
      var filter = CodexFilters.get_filter_by_name(filter_name);
      if (filter) {
        find_terms[filter_name] = filter.dataToSearchTermConverter(filter_value);
      }
    });
  }
  return find_terms;
}

// Return the list of filters available.
Template.codex_filters.get_filters = function() {
  var all_filters = CodexFilters.get_all_filters();
  var selected_filters = Session.get('selected_filters');
  return $.map(all_filters, function(filter) {
    var value = '';
    if (selected_filters && selected_filters[filter.name]) {
      value = selected_filters[filter.name];
    }
    CodexFilters.update_filter_value(filter, value);
    return filter;
  });
}

// Collate search terms and start looking.
var performSearch = function() {
  var url = '';
  $.each(CodexFilters.get_all_filter_names(), function(k, filter_name) {
    var elem = $('.filter_inputs [name="query_' + filter_name + '"]');
    if (elem) {
      text = elem.val();
      if (text && text != '') {
        url += CodexFilters.format_value_for_url(filter_name, text);
      }
    }
  });

  var route = Router.current().route.name; // Here's where we are now.
  var params = Router.current().params;
  if (url.length > 0) {
    params.filters = url.slice(1);
  } else {
    params.filters = 'all';
  }
  // TODO: Fix colon being replaced with %3A?
  Router.go(route, params);
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

