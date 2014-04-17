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

// This initializes some methods that can be called from the client,
// like updating, adding, and deleting entries.
Meteor.methods({
  // Options should include: name, types, slots, text.
  // callbacks.success is a callback which will be handed the ID 
  // of the newly created entry (if successful)
  // callbacks.failure is a callback which will be handed the exception
  // thrown (if unsuccessful)
  createCodice: function(options) {
    check(options, {
      name: NonEmptyString,
      level: IntegerAsString,
      slots: ListOfValidSlots,
      types: ListOfNonEmptyStrings,
      text: NonEmptyString,
      _id: Match.Optional(NonEmptyString)
    });

    // Check permissions.
    if (!this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    if (!isAdmin()) {
      throw new Meteor.Error(403, "You don't have permission to add entries");
    }
    
    // Check name.
    options.name = options.name.trim().toUpperCase();
    if (options.name.length > 100) {
      throw new Meteor.Error(413, "Name too long");
    }
    if (Codex.findOne({name: options.name})) {
      throw new Meteor.Error(413, "Name already exists");
    }
    
    // Check level. Well, not really.
    options.level = parseInt(options.level);
    
    // Check slots.
    options.slots = PenAndPaperUtils.multi_reunderscore(options.slots.split(','));
    if (options.slots.length > 200) {
      throw new Meteor.Error(413, "Slots too long");
    }
    options.slots = options.slots.split(',');
    
    // Check types.
    options.types = PenAndPaperUtils.multi_reunderscore(options.types.split(','));
    if (options.types.length > 200) {
      throw new Meteor.Error(413, "Types too long");
    }
    options.types = options.types.split(',');
    
    // Check text.
    options.text = options.text.trim();
    if (options.text.length > 1000) {
      throw new Meteor.Error(413, "Text too long");
    }

    // Put it in!
    var id = options._id || Random.id();
    Codex.insert({
      _id: id,
      name: options.name,
      level: options.level,
      slots: options.slots,
      types: options.types,
      text: options.text,
      bonuses: [],
      restrictions: []
    });
    return id;
  }
});

// TODO: !!! Make this a real function.
var isAdmin = function() {
  return true;
}

// Match functions.
var NonEmptyString = Match.Where(function(x) {
  check(x, String);
  return x.trim().length !== 0;
});

var ListOfNonEmptyStrings = Match.Where(function(x) {
  check(x, String);
  _.each(x.split(','), function(element) {
    if (element.trim().length === 0) {
      return false;
    }
  });
  return true;
});

var ListOfValidSlots = Match.Where(function (x) {
  check(x, String);
  var slots = SlotsUtils.all();
  _.each(x.split(','), function(element) {
    if (!(_.contains(slots, element.trim()))) {
      return false;
    }
  });
  return true;
});

var IntegerAsString = Match.Where(function(x) {
  check(x, String);
  return parseInt(x);
});

// Populate some test data.
Meteor.startup(function() {
  if (!Codex.findOne()) {
    Codex.insert({
      _id: Random.id(),
      name: 'DAGGER', 
      level: 1, 
      slots: ['one_handed_weapon'],
      types: ['martial', 'weapon', 'dagger', 'parry'],
      text: 'It\'s a tiny knife!',
      bonuses: [],
      restrictions: []});
    Codex.insert({
      _id: Random.id(),
      name: 'SWORD', 
      level: 2, 
      slots: ['one_handed_weapon', 'two_handed_weapon'],
      types: ['martial', 'weapon', 'sword', 'parry'],
      text: 'It\'s a sword!',
      bonuses: [],
      restrictions: []});
    Codex.insert({
      _id: Random.id(),
      name: 'WAND', 
      level: 1, 
      slots: ['one_handed_weapon'],
      types: ['arcane', 'weapon', 'wand'],
      text: 'It\'s Harry Potter\'s!',
      bonuses: [],
      restrictions: []});
    Codex.insert({
      _id: Random.id(),
      name: 'BLINK', 
      level: 1, 
      slots: ['ability'],
      types: ['arcane', 'spell'],
      text: 'Teleport 5 spaces.',
      bonuses: [],
      restrictions: []});
  }
});

