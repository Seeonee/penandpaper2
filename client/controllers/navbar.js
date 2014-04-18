
// These are the pages we can visit.
var navlinks = [
  'home',
  'characters',
  'codex',
  'glossary'
];

// Get the list of available navigation links.
Template.navbar.navlinks = function() {
  // This lets us render the current page with specialness.
  var visiting = Router.current();
  if (visiting) {
    visiting = visiting.route.name;
  }
  return _.map(navlinks, function(element) {
    return {
      name: CaseUtils.capitalize(element),
      path: element,
      visiting: (element === visiting) ? 'visiting' : ''
    };
  });
}

