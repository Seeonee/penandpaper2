
// Default character values.
CharacterDefaults = {};

// These can be spent, and are gained on level-up;
// should never drop negative.
CharacterDefaults.points = {
  skill_points: 8,
  key_points: 3
};

// Stats that are affected by various equipped slots.
CharacterDefaults.attributes = {
  max_hp: 20,
  max_mana: 0,
  speed: 5,
  wounds_per_battle: 2
}

// Devotion to particular gods.
// The 'any' devotion gets lumped into 
// a single devotion of the character's (player's) chosing.
CharacterDefaults.devotions = {
  any: 0,
  death: 0,
  fae: 0,
  sea: 0,
  storm: 0,
  sun: 0,
  war: 0,
  wisdom: 0
};

// These are used for skill checks.
CharacterDefaults.skills = {
  might: {
    active: 0,
    passive: 0
  },
  wit: {
    active: 0,
    passive: 0
  },
  stealth: {
    active: 0,
    passive: 0
  },
  presence: {
    active: 0,
    passive: 0
  }
}

// The BIG one! This lays out the default slots
// that a character can equip, as well as their costs,
// max levels, etc.
CharacterDefaults.createEmptySlots = function() {
  // TODO: Should this be:
  //  * a list of slots which each have .name?
  //  * a map of {names: slots}?
  var slots = {};
  
  // Character-definers first.
  // Heritage.
  slots.heritage = {
    1: {
      cost: 0,
      filled: 0,
      lock: 0,
      unlocked: 0
    }
  };
  // Calling.
  slots.calling = {
    1: {
      cost: 0,
      filled: 0,
      lock: 0,
      unlocked: 0
    }
  };
  
  // Weapons next.
  // One-handed weapons.
  slots.one_handed_weapon = [
    {
      // First one-handed weapon.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      },
      2: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      },
      3: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }
    }, {
      // Second one-handed weapon.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      },
      2: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      },
      3: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }
    }
  ];
  
  // One-handed weapon upgrades.
  slots.one_handed_weapon_upgrade = [
    {
      // First one-handed weapon upgrade.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      },
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }, {
      // Second one-handed weapon upgrade.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      },
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }
  ];
  
  // Two-handed weapon.
  slots.two_handed_weapon = {
    1: {
      cost: 0,
      filled: 0,
      lock: 0,
      unlocked: 0,
      learned_by_default: 1
    },
    2: {
      cost: 1,
      filled: 0,
      lock: 0,
      unlocked: 0
    },
    3: {
      cost: 1,
      filled: 0,
      lock: 0,
      unlocked: 0
    }
  };
  
  // Two-handed weapon upgrade.
  slots.two_handed_weapon_upgrade = {
    1: {
      cost: 1,
      filled: 0,
      lock: 0,
      unlocked: 0
    }, 
    2: {
      cost: 1,
      filled: 0,
      lock: 1,
      unlocked: 0
    }
  };
  
  // Two-handed ranged weapon.
  slots.two_handed_ranged_weapon = {
    1: {
      cost: 1,
      filled: 0,
      lock: 0,
      unlocked: 0
    },
    2: {
      cost: 1,
      filled: 0,
      lock: 0,
      unlocked: 0
    }
  };
  
  // Two-handed ranged weapon upgrade.
  slots.two_handed_ranged_weapon_upgrade = {
    1: {
      cost: 1,
      filled: 0,
      lock: 0,
      unlocked: 0
    }, 
    2: {
      cost: 1,
      filled: 0,
      lock: 1,
      unlocked: 0
    }
  };
  
  // Shields.
  slots.one_handed_shield = [
    {
      // First shield.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      },
      2: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }
    }, {
      // Second shield.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      },
      2: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }
    }
  ];
  
  // Shield upgrades.
  slots.one_handed_shield_upgrade = [
    {
      // First shield upgrade.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }, 
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }, {
      // Second shield upgrade.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }, 
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }
  ];
  
  // Armor.
  slots.armor = {
    1: {
      cost: 1,
      filled: 0,
      lock: 0,
      unlocked: 0
    },
    2: {
      cost: 1,
      filled: 0,
      lock: 0,
      unlocked: 0
    },
    3: {
      cost: 1,
      filled: 0,
      lock: 0,
      unlocked: 0
    }
  };
  
  // Armor upgrades.
  slots.armor_upgrade = [
    {
      // First armor upgrade.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }, 
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }, {
      // Second armor upgrade.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }, 
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }
  ];
  
  // Gifts.
  slots.gift = [
    {
      // First gift.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }, 
      2: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }
    }, {
      // Second gift.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }, 
      2: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }
    }, {
      // Third gift.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }, 
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }, {
      // Fourth gift.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }, 
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }
  ];
  
  // Curses.
  slots.curse = [
    {
      // First curse.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }
    }, {
      // Second curse.
      1: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }
  ];
  
  // Abilities.
  slots.ability = [
    {
      // First ability.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      },
      2: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      },
      3: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }
    }, {
      // Second ability.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      },
      2: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      },
      3: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }, {
      // Third ability.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      },
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      },
      3: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }, {
      // Fourth ability.
      1: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      },
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      },
      3: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }
  ];
  
  // Ability upgrades.
  slots.ability_upgrade = [
    {
      // First ability upgrade.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }, 
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }, {
      // Second ability upgrade.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }, 
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }, {
      // Third ability upgrade.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }, 
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }, {
      // Fourth ability upgrade.
      1: {
        cost: 1,
        filled: 0,
        lock: 0,
        unlocked: 0
      }, 
      2: {
        cost: 1,
        filled: 0,
        lock: 1,
        unlocked: 0
      }
    }
  ];

  return slots;
}


