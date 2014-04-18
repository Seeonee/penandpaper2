/**
 * Some oft-reused methods.
 */

PenAndPaperUtils = {}

// Take "hello_world" and return "Hello world".
PenAndPaperUtils.deunderscore = function(s) {
  var s2 = s.toLowerCase().trim().replace(/_/g, ' ');
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
  var s2 = s.trim().toLowerCase().replace(/ /g, '_');
  return s2;
}

// Take a list, feed it through reunderscore, 
// and join it together.
PenAndPaperUtils.multi_reunderscore = function(s) {
  return _.map(s, PenAndPaperUtils.reunderscore).join(',');
}

// Take a URL string like "term+1&term+2" and split
// it into ["term_1, "term_2"].
// Also converts raw spaces into underscores.
PenAndPaperUtils.deurl_terms = function(url) {
  var strings = url.replace(/[ \+]+/g, '_').split('&');
  return strings;
}

// Take a set of strings like ["term_1", "term_2"] and transform
// it into "term+1&term+2".
PenAndPaperUtils.reurl_terms = function(strings) {
  var url = strings.join('&').replace(/_/g, '+');
  return url;
}

// Get formatted dates.
PenAndPaperUtils.formatDate = function(epoch) {
  return new Date(epoch);
}

// Regular expression quoting.
RegExp.quote = function(str) {
    return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
}

// For now, we duplicate admin checking across client and server.
// With this knowledge, a JS-savvy user an fake out the client to think
// they're admin. However, all the data manipulation methods live server-side
// only, which has its own copy of this validation that should be incorruptable.

// List of admin user IDs.
var admins = [
  'kevin@email.com'
];

// Function for testing if a user is logged in as admin.
PenAndPaperUtils.isUserAdmin = function() {
  return Meteor.user() && _.contains(admins, Meteor.user().emails[0].address);
}

