/**
 * Some oft-reused methods.
 */

SlotsUtils = {}

// List of all possible slots.
SlotsUtils.all = function() {
  return {
    'ability': 4,
    'ability upgrade': 4,
    'armor': 1,
    'armor upgrade': 2,
    'calling': 1,
    'curse': 2,
    'gift': 4,
    'heritage': 1,
    'one handed shield': 2,
    'one handed shield upgrade': 2,
    'one handed weapon': 2,
    'one handed weapon upgrade': 2,
    'two handed weapon': 2,
    'two handed weapon upgrade': 2,
    'two handed ranged weapon': 2,
    'two handed ranged weapon upgrade': 2
  };
}

// Figure out if a slot is valid.
// The param should look like {name: name, id: id}.
SlotsUtils.isValidSlot = function(slot) {
  var all = SlotsUtils.all();
  var name = slot.name.replace(/_/g, ' ').trim();
  if (name in all) {
    if (slot.id == null || (slot.id >= 1 && slot.id <= all[name])) {
      return true;
    }
  }
  return false;
}

