/**
 * Some oft-reused methods.
 */

PenAndPaperUtils = {}

// Take "hello_world" and return "Hello world".
PenAndPaperUtils.deunderscore = function(s) {
  var s2 = s.toLowerCase().replace(/_/g, ' ');
  s2 = s2[0].toUpperCase() + s2.slice(1);
  return s2;
}

// Take a list, feed it through deunderscore, 
// and join it together.
PenAndPaperUtils.multi_deunderscore = function(s) {
  return _.map(s, PenAndPaperUtils.deunderscore).join(', ');
}

// Take "Hello world" and return "hello_world".
PenAndPaperUtils.reunderscore = function(s) {
  var s2 = $.trim(s).toLowerCase().replace(/ /g, '_');
  return s2;
}

// Take a list, feed it through reunderscore, 
// and join it together.
PenAndPaperUtils.multi_reunderscore = function(s) {
  return _.map(s, PenAndPaperUtils.reunderscore).join(',');
}

// Take a URL string like "term+1&term+2" and split
// it into ["term_1, "term_2"].
PenAndPaperUtils.deurl_terms = function(url) {
  var strings = url.replace(/\+/g, '_').split('&');
  return strings;
}

// Take a set of strings like ["term_1", "term_2"] and transform
// it into "term+1&term+2".
PenAndPaperUtils.reurl_terms = function(strings) {
  var url = strings.join('&').replace(/_/g, '+');
  return url;
}

// Takes a URL match in the form of:
// field1:filter1/field2:filter2/...
// and converts it into a parameters map in the style:
// {field1: filter1, field2: filter2, ... }
// Also note that some de-URLing is performed on the filters.
// Any field which isn't found is ignored.
// Any field which is filtered more than once will use the last filter.
// Any filter which can be specified but isn't is still in the map, with a null value.
PenAndPaperUtils.decode_url_filter_terms = function(url, default_filter) {
  default_filter = default_filter || null;
  var filter_names = ['name', 'slots', 'types', 'level', 'text'];
  var params = {};
  $.each(filter_names, function(i, v) {
    params[v] = default_filter;
  });
  
  pieces = url.split('/');
  $.each(pieces, function(i, v) {
    var index = v.indexOf(':');
    var filter_name = v.slice(0, index);
    var filter_value = v.slice(1 + index);
    if (filter_name in params) {
      params[filter_name] = PenAndPaperUtils.deurl_terms(filter_value);
    }
  });
  return params;
}

// Regular expression quoting.
RegExp.quote = function(str) {
    return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};



