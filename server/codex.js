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
    created_by: 1,
    updated_by: 1,
    last_modified_on: 1
  }});
});

// Set up access permissions.
Codex.allow({
  insert: false,
  update: false,
  remove: false
});

// This initializes some methods that can be called from the client,
// like updating, adding, and deleting entries.
Meteor.methods({
  // ------------------------------------------------------------------ //
  // Options is a map including _id, name, level types, slots, and text.
  createCodice: function(options) {
    // Check permissions.
    if (!this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    if (!isAdmin()) {
      throw new Meteor.Error(403, "You don't have permission to add entries");
    }

    // Check parameters.
    check(options, {
      name: NonEmptyString,
      level: IntegerAsString,
      slots: ListOfValidSlots,
      types: ListOfNonEmptyStrings,
      text: NonEmptyString
    });

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
    options.text.replace('<br />', '\n');
    options.text = _.unescape(options.text);
    if (options.text.length > 1000) {
      throw new Meteor.Error(413, "Text too long");
    }
    
    // Put it in!
    var id = Random.id();
    Codex.insert({
      _id: id,
      name: options.name,
      level: options.level,
      slots: options.slots,
      types: options.types,
      text: options.text,
      bonuses: [],
      created_by: Meteor.user().emails[0].address,
      last_modified_on: Date.now()
    });
    return id;
  },
  
  // ------------------------------------------------------------------ //
  // Options should include: _id.
  deleteCodice: function(options) {
    check(options, {
      _id: NonEmptyString
    });

    // Check permissions.
    if (!this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    if (!isAdmin()) {
      throw new Meteor.Error(403, "You don't have permission to delete entries");
    }
    
    // Check that it exists.
    var codice = Codex.findOne({_id: options._id});
    if (!codice) {
      throw new Meteor.Error(413, "Entry does not exist");
    }
    var name = codice.name;
    Codex.remove({_id: options._id});
    return name;
  },
  
  // ------------------------------------------------------------------ //
  // Options is a map of: name, level, types, slots, text.
  // It's okay to change the name, as long as it's a new unique name.
  updateCodice: function(options) {
    // Check permissions.
    if (!this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    if (!isAdmin()) {
      throw new Meteor.Error(403, "You don't have permission to add entries");
    }

    // Check parameters.
    check(options, {
      _id: NonEmptyString,
      name: NonEmptyString,
      level: IntegerAsString,
      slots: ListOfValidSlots,
      types: ListOfNonEmptyStrings,
      text: NonEmptyString
    });
    
    // Check ID.
    if (!Codex.findOne({_id: options._id})) {
      throw new Meteor.Error(413, "Entry does not exist");
    }

    // Check name.
    options.name = options.name.trim().toUpperCase();
    if (options.name.length > 100) {
      throw new Meteor.Error(413, "Name too long");
    }
    // See if this name exists on any entry BUT the one with this ID.
    if (Codex.findOne({name: options.name, _id: {$ne: options._id}})) {
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

    // Update it!
    Codex.update({ _id: options._id}, { $set: {
      name: options.name,
      level: options.level,
      slots: options.slots,
      types: options.types,
      text: options.text,
      bonuses: [],
      updated_by: Meteor.user().emails[0].address,
      last_modified_on: Date.now()
    }});
  }
});

// Check if the user's logged in as admin.
var isAdmin = function() {
  return Meteor.call('isUserLoggedInAsAdmin');
}

// Match functions.
// Match a nonempty string.
var NonEmptyString = Match.Where(function(x) {
  check(x, String);
  return x.trim().length !== 0;
});

// Match a comma-separated list of nonempty strings.
var ListOfNonEmptyStrings = Match.Where(function(x) {
  check(x, String);
  _.each(x.split(','), function(element) {
    if (element.trim().length === 0) {
      return false;
    }
  });
  return true;
});

// Match a comma-separated list of valid slot names.
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

// Match a string which can be int'd.
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
      created_by: 'kevin@mail.com',
      last_modified_on: Date.now()});
    Codex.insert({
      _id: Random.id(),
      name: 'SWORD', 
      level: 2, 
      slots: ['one_handed_weapon', 'two_handed_weapon'],
      types: ['martial', 'weapon', 'sword', 'parry'],
      text: 'It\'s a sword!',
      bonuses: [],
      created_by: 'kevin@mail.com',
      last_modified_on: Date.now()});
    Codex.insert({
      _id: Random.id(),
      name: 'WAND', 
      level: 1, 
      slots: ['one_handed_weapon'],
      types: ['arcane', 'weapon', 'wand'],
      text: 'It\'s Harry Potter\'s!',
      bonuses: [],
      created_by: 'kevin@mail.com',
      last_modified_on: Date.now()});
    Codex.insert({
      _id: Random.id(),
      name: 'BLINK', 
      level: 1, 
      slots: ['ability'],
      types: ['arcane', 'spell'],
      text: 'Teleport 5 spaces.',
      bonuses: [],
      created_by: 'kevin@mail.com',
      last_modified_on: Date.now()});
  }
});


