/**
 * Codex model.
 */
Meteor.publish("codex", function () {
  return Codex.find({}, {fields: {
    name: 1, 
    level: 1, 
    slots: 1,
    types: 1,
    text: 1,
    bonuses: 1,
    restrictions: 1
  }});
});

// Set up access permissions.
Codex.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin
});

// TODO: Implement.
// TODO: Move elsewhere?
var isAdmin = function() {
  return false;
}

// Populate some test data.
Meteor.startup(function() {
  if (!Codex.findOne()) {
    Codex.insert({
      name: 'dagger', 
      level: 1, 
      slots: ['one_handed_weapon'],
      types: ['martial', 'weapon', 'dagger', 'parry'],
      text: 'It\'s a tiny knife!',
      bonuses: [],
      restrictions: []});
    Codex.insert({
      name: 'sword', 
      level: 2, 
      slots: ['one_handed_weapon', 'two_handed_weapon'],
      types: ['martial', 'weapon', 'sword', 'parry'],
      text: 'It\'s a sword!',
      bonuses: [],
      restrictions: []});
    Codex.insert({
      name: 'wand', 
      level: 1, 
      slots: ['one_handed_weapon'],
      types: ['arcane', 'weapon', 'wand'],
      text: 'It\'s Harry Potter\'s!',
      bonuses: [],
      restrictions: []});
    Codex.insert({
      name: 'blink', 
      level: 1, 
      slots: ['ability'],
      types: ['arcane', 'spell'],
      text: 'Teleport 5 spaces.',
      bonuses: [],
      restrictions: []});
  }
});

