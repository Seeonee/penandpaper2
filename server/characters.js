/**
 * Character model.
 */
Meteor.publish("characters", function () {
  return Characters.find({}, {fields: {
    name: 1, 
    level: 1,
    points: 1,
    attributes: 1,
    devotions: 1,
    skills: 1,
    slots: 1,
    
    owner: 1, 
    created: 1,
    last_modified_on: 1
  }});
});

// Set up access permissions.
Characters.allow({
  insert: false,
  update: false,
  remove: false
});

// Check (by email address) if a particular user exists.
var userExists = function(user) {
  return Meteor.users.findOne({emails: {$elemMatch: {address: user}}});
}

// Check if a character already has the chosen name.
var characterExists = function(name) {
  return Characters.findOne({name: {$regex: RegExp.quote(name), $options: 'i'}});
}

// Attempt to create a new named character with a given owner.
var createCharacter = function(name, owner) {
  if (!userExists(owner)) {
    throw new Meteor.Error(403, 'User "' + owner + '" does not exist');
  }
  name = name.trim();
  if (characterExists(name)) {
    throw new Meteor.Error(403, 'Character name "' + name + '" already in use');
  }
  
  // Make a nice default batch of slots.
  var slots = CharacterDefaults.createEmptySlots();
  
  // Put it all together into a map.
  var character = {
    _id: Random.id(),
    name: name,
    level: 1,
    points: {
      skill_points: CharacterDefaults.points.skill_points,
      key_points: CharacterDefaults.points.key_points,
    },
    attributes: {
      max_hp: CharacterDefaults.attributes.max_hp,
      max_mana: CharacterDefaults.attributes.max_mana,
      speed: CharacterDefaults.attributes.speed,
      wounds_per_battle: CharacterDefaults.attributes.wounds_per_battle
    },
    devotions: {
      any: CharacterDefaults.devotions.any,
      death: CharacterDefaults.devotions.death,
      fae: CharacterDefaults.devotions.fae,
      sea: CharacterDefaults.devotions.sea,
      storm: CharacterDefaults.devotions.storm,
      sun: CharacterDefaults.devotions.sun,
      war: CharacterDefaults.devotions.war,
      wisdom: CharacterDefaults.devotions.wisdom
    },
    skills: {
      might: {
        active: CharacterDefaults.skills.might.active,
        passive: CharacterDefaults.skills.might.passive
      },
      wit: {
        active: CharacterDefaults.skills.wit.active,
        passive: CharacterDefaults.skills.wit.passive
      },
      stealth: {
        active: CharacterDefaults.skills.stealth.active,
        passive: CharacterDefaults.skills.stealth.passive
      },
      presence: {
        active: CharacterDefaults.skills.presence.active,
        passive: CharacterDefaults.skills.presence.passive
      }
    },
    slots: slots,
    
    date_created: Date.now(),
    owner: owner
  }
  
  Characters.insert(character);
}


// Populate some test data.
Meteor.startup(function() {
  if (!Characters.findOne()) {
    createCharacter('Hackett', 'aj@email.com');
    createCharacter('Grimm', 'jess@email.com');
    createCharacter('Heian', 'dale@email.com');
    createCharacter('Vetis', 'keith@email.com');
    createCharacter('Jazz', 'joe@email.com');
    createCharacter('Celery', 'kevin@email.com');
  }
});

