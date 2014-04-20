
// List of all skills as divided into specific subsections.
Template.skilltree.sections = function() {
  return SkilltreeUtils.sections_for_character(this);
}

// Is a tile clickable?
// Here are the scenarios under which you should click a tile:
//  * Because you've equipped it and want to unequip it.
//  * Because you've spent a skillpoint in it but haven't equipped it.
Template.skilltree_tile.clickable = function() {
  var clickable = false;
  var slot = this.slot;
  if (slot.equipped) {
    clickable = true;
  } else {
    // Is at least one level unlocked?
    _.each(slot, function(value) {
      if (value.filled > 0) {
        clickable = true;
      }
    });
  }
  return (clickable) ? 'clickable' : '';
}

// Is a tile activated?
// I.e. is anything equipped to it?
Template.skilltree_tile.activated = function() {
  return (this.slot.equipped) ? 'activated' : '';
}

// Some slots have more than one instance.
// This figures out which instance to use.
Template.skilltree_tile.slot_id = function() {
  var slot_id = null;
  if (this.slot.slot_id != null) {
    slot_id = this.slot.slot_id;
  }
  return slot_id;
}

// Get the name of the skill equipped in this slot.
Template.skilltree_tile.equipped_name = function() {
  var name = '';
  var equipped_id = this.slot.equipped;
  if (equipped_id) {
    var skill = Codex.findOne({_id: equipped_id});
    if (skill) {
      name = skill.name;
    }
  }
  return name;
}

// Get the list of level boxes.
Template.skilltree_tile.levelboxes = function() {
  var slot = this.slot;
  var num_slots = _.size(slot);
  if ('slot_id' in slot) {
    --num_slots;
  }
  var levelboxes = [];
  
  var skillPointsRemaining = 0;
  var keyPointsRemaining = 0;
  var char_name = Session.get('selected_character');
  if (char_name) {
    var character = Characters.findOne({name: char_name});
    if (character) {
      skillPointsRemaining = character.points.skill_points - character.points_spent.skill_points;
      keyPointsRemaining = character.points.key_points - character.points_spent.key_points;
    }
  }
  
  var previous = null;
  var current = (num_slots >= 1) ? slot[1] : null;
  var next = (num_slots >= 2) ? slot[2] : null;
  // Note the iteration from 1 to less-than-or-equal-to size...
  for (var i = 1; i <= num_slots; i++) {
    // If we got here, current can't be null.
    var attributes = [];
    var tooltips = [];
    // Some skills are freebies.
    if (current.lock == 0 && !current.learned_by_default && current.cost == 0) {
      attributes.push('free');
      tooltips.push('This slot is free to fill in.');
    } else if (current.cost < 0) {
      attributes.push('negative');
      tooltips.push('This slot provides skill points when filled in.');
    }
    if (current.filled == 1) {
      // This slot's been learned.
      attributes.push('activated');
      if (current.unlocked == 1) {
        // It had to be unlocked, though.
        attributes.push('unlocked');
      }
      if (next == null || next.filled == 0) {
        // Since nothing further's been learned,
        // this slot can be clicked to unlearn it.
        // Unless! The slot may need to be unequipped first.
        if (slot.equipped == null) {
          attributes.push('clickable');
          tooltips.push('Ctrl + click to clear this slot.');
        }
      }
    } else {
      if (current.learned_by_default == 1) {
        attributes.push('default');
        // This slot can never be clicked, but
        // it still might be filled in.
        if (next != null && next.filled == 1) {
          attributes.push('activated')
        }
      } else {
        if (current.lock == 1) {
          // Locked by default...
          if (current.unlocked == 0) {
            // ...and currently not unlocked.
            attributes.push('locked');
            // It can only be unlocked if with a key...
            if (keyPointsRemaining) {
              // ...provided the previous slot is already unlocked.
              if (previous == null || previous.lock == 0 || previous.unlocked == 1) {
                // It can be unlocked! Make it clickable.
                attributes.push('clickable');
                tooltips.push('Click to unlock this slot.');
              }
            }
          } else {
            // It's been unlocked already.
            attributes.push('unlocked');
            if (current.filled == 0 && (previous == null || previous.unlocked == 0)) {
              // It can be re-locked.
              attributes.push('clickable');
              // But first, can it be filled?
              var cost = current.cost;
              if ((skillPointsRemaining - cost) >= 0) {
                if (previous == null || previous.filled > 0 || previous.learned_by_default) {
                  // Affordable and prereq'd!
                  tooltips.push('Click to fill in this slot.');
                }
              }
              tooltips.push('Ctrl + click to re-lock this slot.');
            }
          }
        } else {
          // Not yet learned, not locked...
          var cost = current.cost;
          if ((skillPointsRemaining - cost) >= 0) {
            // ...and we can afford the cost...
            if (previous == null || previous.filled > 0 || previous.learned_by_default) {
              // And we've learned all the prerequisites!
              attributes.push('clickable');
              tooltips.push('Click to fill in this slot.');
            }
          }
        }
      }
    }
    previous = current;
    current = next;
    next = (i < num_slots) ? slot[i + 2] : null;
    levelboxes.push({
      level: i - 1,
      attributes: attributes.join(' '),
      tooltip: tooltips.join('\n')
    });
  }
  return levelboxes;
}

// Listen for fill and unlock events.
Template.skilltree_tile.events({
  'click .levelBox.clickable': function(evt, template) {
    var options = {
      character_name: Session.get('selected_character'),
      slot_name: template.data.name.replace(' ', '_'),
      slot_level: $(evt.target).data().level + 1
    }
    if (template.data.id) {
      options.slot_id = template.data.id;
    }
    if (evt.ctrlKey) {
      options.clear = true;
    }
    Meteor.call('characterLevelbox', options, function(err, result) {
      if (err) {
        console.log(err);
      }
    });
  }
});



