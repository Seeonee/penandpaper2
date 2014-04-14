/**
 * Some oft-reused methods.
 */

FilterUtils = {}

var all_filters = {};

// Return a list of all filter objects.
FilterUtils.get_all_filters = function() {
  return all_filters;
}

// Return a list of all filter names.
FilterUtils.get_all_filter_names = function() {
  return _.map(all_filters, function(value, key) {
    return key;
  });
}

// Return a filter object by name.
FilterUtils.get_filter_by_name = function(name) {
  return all_filters[name];
}

// This one updates a filter's value.
FilterUtils.update_filter_value = function(filter, value) {
  if (filter.is_text_filter) {
    filter.value = value;
  } else {
    if (value.length) {
      value = value[0];
    }
    value = value.replace(/_/g, ' ');
    $.each(filter.options, function(k, option) {
      option.selected = (option.name == value) ? 'selected' : '';
    });
  }
}

// Add a text filter.
FilterUtils.add_text_filter = function(name, 
                                       dataToSearchTermConverter, 
                                       dataToURLConverter) {
  dataToURLConverter = dataToURLConverter || default_data_to_url_converter;
  var value = null;
  // This should update the filter's value reactively.
  var filters = Session.get('session_filters');
  if (filters && filters[name]) {
    value = filters[name];
  }
  
  var filter = {
    name: name,
    name_pretty: CaseUtils.capitalize(name),
    is_text_filter: true,
    value: value,
    dataToSearchTermConverter: dataToSearchTermConverter,
    dataToURLConverter: dataToURLConverter,
  };
  all_filters[name] = filter;
  return filter;
}

var filter_value_getter = function() {
}

// Add a multiple choice filter.
FilterUtils.add_multiple_choice_filter = function(name, 
                                                  choices, 
                                                  dataToSearchTermConverter, 
                                                  dataToURLConverter) {
  dataToURLConverter = dataToURLConverter || default_data_to_url_converter;
  var value = null;
  // This should update the filter's value reactively.
  var filters = Session.get('session_filters');
  if (filters && filters[name]) {
    value = filters[name];
    value = value[0].replace(/_/g, ' ');
  }
  
  var options = [];
  $.each(choices, function(k, v) {
    options.push({
      name: v,
      name_pretty: CaseUtils.capitalize(v),
      selected: (v == value) ? 'selected' : ''
    });
  });
  
  var filter = {
    name: name,
    name_pretty: CaseUtils.capitalize(name),
    is_text_filter: false,
    options: options,
    dataToSearchTermConverter: dataToSearchTermConverter,
    dataToURLConverter: dataToURLConverter,
  };
  all_filters[name] = filter;
  return filter;
}

// Takes a URL match in the form of:
// field1:filter1/field2:filter2/...
// and converts it into a parameters map in the style:
// {field1: filter1, field2: filter2, ... }
// Also note that some de-URLing is performed on the filters.
// Any field which isn't found is ignored.
// Any field which is filtered more than once will use the last filter.
// Any filter which can be specified but isn't is left out of the map.
FilterUtils.decode_url_filter_terms = function(url) {
  var params = {};
  var filter_names = FilterUtils.get_all_filter_names();
  
  pieces = url.split('/');
  $.each(pieces, function(i, v) {
    var index = v.indexOf(':');
    var filter_name = v.slice(0, index);
    var filter_value = v.slice(1 + index);
    if ($.inArray(filter_name, filter_names) >= 0) {
      params[filter_name] = PenAndPaperUtils.deurl_terms(filter_value);
    }
  });
  return params;
}

// Create nicely formatted URL additions.
FilterUtils.format_value_for_url = function(filter_name, text) {
  if (filter_name in all_filters) {
    var s = text.trim().toLowerCase();
    return '/' + filter_name + ':' + all_filters[filter_name].dataToURLConverter(text);
  } else {
    // If it's not something we can filter on,
    // don't try to stuff it into the URL bar.
    return '';
  }
}

// These next few functions are used to take the text value
// from an input element and turn it into a portion of a URL.

// Default function for converting data into a URL.
var default_data_to_url_converter = function(text) {
  return text.trim().toLowerCase();
}

// More complicated function for converting data into a URL;
// this one splits up by commas and returns an ampersanded list.
var as_list_data_to_url_converter = function(text) {
  var s = text.trim().toLowerCase();
  s = s.replace(/ +/g, '+');
  s = s.replace(/[,\+]{1,}/g, '&');
  return s;
}

// The next bunch of functions are used when converting
// the contents of a de-URLed set of filter values into
// something that Mongo can filter a find() on.

// Used for filters which want to do a regex text search.
var regex_match = function(values) {
  return {
    $regex: RegExp.quote(values[0]),
    $options: 'i'
  };
}

// Used for filters which want to match all items in an array.
var all_in_list_match = function(values) {
  // TODO: Change to take the string value, and do the to-array splitting here?
  return {$all: values};
}

// Used for filters which want to match a value as an int.
var int_match = function(values) {
  return parseInt(values[0]);
}

// Initialize a bunch of filter stuff.
FilterUtils.initialize = function() {
  FilterUtils.filters = [];
  FilterUtils.add_text_filter('name', regex_match);
  FilterUtils.add_text_filter('types', all_in_list_match, as_list_data_to_url_converter);
  FilterUtils.add_text_filter('text', regex_match);
  FilterUtils.add_text_filter('level', int_match);
  
  // This one's special.
  var choices = [
    '',
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
  FilterUtils.add_multiple_choice_filter('slots', choices, all_in_list_match);
}

FilterUtils.initialize();

