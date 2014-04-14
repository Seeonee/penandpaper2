/**
 * Some oft-reused methods.
 */

CaseUtils = {}

// Capitalize the first letter of a string.
CaseUtils.capitalize = function(s) {
  if (s && s.length > 0) {
    return s[0].toUpperCase() + s.slice(1);
  }
  return s;
}

