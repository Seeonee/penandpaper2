
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
Template.skilltree_tile.active = function() {
  return (this.slot.equipped) ? 'active' : '';
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

