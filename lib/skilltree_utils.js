/*
 * Helper functions for building out the skilltree.
 */
SkilltreeUtils = {};

// Add in a slot instance identifier.
var getSlotID = function(slot, instance) {
  return _.extend(slot[instance - 1], {slot_id: instance});
}

// List of all skills as divided into specific subsections.
SkilltreeUtils.sections_for_character = function(character) {
  // Variables and placeholder initializations.
  var sections = [];

  return [
    {
      // Heritage and calling.
      section: 'heritage_and_calling',
      subsections: [
        {
          // Heritage.
          heading: 'heritage',
          banner: 'CHOOSE YOUR HERITAGE',
          tiles: [
            {
              name: 'heritage',
              name_pretty: 'HERITAGE',
              slot: character.slots.heritage
            }
          ]
        }, {
          // Calling.
          heading: 'calling',
          banner: 'CHOOSE YOUR CALLING',
          tiles: [
            {
              name: 'calling',
              name_pretty: 'CALLING',
              slot: character.slots.calling
            }
          ]
        }
      ]
    }, {
      // Weapons.
      section: 'weapons',
      subsections: [
        {
          heading: 'weapons',
          banner: 'EQUIP YOUR WEAPONS',
          tiles: [
            {
              // Two handed weapon.
              name: 'two_handed_weapon',
              name_pretty: 'MELEE WEAPON (TWO HANDED)',
              slot: character.slots.two_handed_weapon
            }, {
              // Two handed weapon upgrade.
              name: 'two_handed_weapon upgrade',
              name_pretty: 'UPGRADE WEAPON',
              slot: character.slots.two_handed_weapon_upgrade
            }, {
              // One handed weapon #1.
              name: 'one_handed_weapon',
              id: 1,
              name_pretty: 'MELEE WEAPON (MAIN HAND)',
              slot: getSlotID(character.slots.one_handed_weapon, 1)
            }, {
              // One handed weapon upgrade #1.
              name: 'one_handed_weapon upgrade',
              id: 1,
              name_pretty: 'UPGRADE WEAPON',
              slot: getSlotID(character.slots.one_handed_weapon_upgrade, 1)
            }, {
              // One handed weapon #2.
              name: 'one_handed_weapon',
              id: 2,
              name_pretty: 'MELEE WEAPON (OFFHAND)',
              slot: getSlotID(character.slots.one_handed_weapon, 2)
            }, {
              // One handed weapon upgrade #2.
              name: 'one_handed_weapon upgrade',
              id: 2,
              name_pretty: 'UPGRADE WEAPON',
              slot: getSlotID(character.slots.one_handed_weapon_upgrade, 2)
            }, {
              // Shield #1.
              name: 'one_handed_shield',
              id: 1,
              name_pretty: 'SHIELD (MAIN HAND)',
              slot: getSlotID(character.slots.one_handed_shield, 1)
            }, {
              // Shield upgrade #1.
              name: 'one_handed_shield upgrade',
              id: 1,
              name_pretty: 'UPGRADE SHIELD',
              slot: getSlotID(character.slots.one_handed_shield_upgrade, 1)
            }, {
              // Shield #2.
              name: 'one_handed_shield',
              id: 2,
              name_pretty: 'SHIELD (OFFHAND)',
              slot: getSlotID(character.slots.one_handed_shield, 2)
            }, {
              // Shield upgrade #2.
              name: 'one_handed_shield upgrade',
              id: 2,
              name_pretty: 'UPGRADE SHIELD',
              slot: getSlotID(character.slots.one_handed_shield_upgrade, 2)
            }, {
              // Two handed ranged weapon.
              name: 'two_handed_ranged_weapon',
              name_pretty: 'RANGED WEAPON (TWO HANDED)',
              slot: character.slots.two_handed_ranged_weapon
            }, {
              // Two handed ranged weapon upgrade.
              name: 'two_handed_ranged_weapon upgrade',
              name_pretty: 'UPGRADE WEAPON',
              slot: character.slots.two_handed_ranged_weapon_upgrade
            }
          ]
        }
      ]
    }, {
      // Armor.
      section: 'armor',
      subsections: [
        {
          heading: 'armor',
          banner: 'EQUIP YOUR ARMOR',
          tiles: [
            {
              // Armor.
              name: 'armor',
              name_pretty: 'ARMOR',
              slot: character.slots.armor
            }, {
              // Armor upgrade #1.
              name: 'armor upgrade',
              id: 1,
              name_pretty: 'UPGRADE ARMOR',
              slot: getSlotID(character.slots.armor_upgrade, 1)
            }, {
              // Armor upgrade #2.
              name: 'armor upgrade',
              id: 2,
              name_pretty: 'UPGRADE ARMOR',
              slot: getSlotID(character.slots.armor_upgrade, 2)
            }
          ]
        }
      ]
    }, {
      // Gifts.
      section: 'gifts',
      subsections: [
        {
          heading: 'gifts',
          banner: 'CHOOSE YOUR GIFTS',
          tiles: [
            {
              // Gift #1.
              name: 'gift',
              id: 1,
              name_pretty: 'GIFT',
              slot: getSlotID(character.slots.gift, 1)
            }, {
              // Gift #2.
              name: 'gift',
              id: 2,
              name_pretty: 'GIFT',
              slot: getSlotID(character.slots.gift, 2)
            }, {
              // Gift #3.
              name: 'gift',
              id: 3,
              name_pretty: 'GIFT',
              slot: getSlotID(character.slots.gift, 3)
            }, {
              // Gift #4.
              name: 'gift',
              id: 4,
              name_pretty: 'GIFT',
              slot: getSlotID(character.slots.gift, 4)
            }
          ]
        }
      ]
    }, {
      // Curses.
      section: 'curses',
      subsections: [
        {
          heading: 'curses',
          banner: 'CHOOSE YOUR CURSES',
          tiles: [
            {
              // Curse #1.
              name: 'curse',
              id: 1,
              name_pretty: 'CURSE',
              slot: getSlotID(character.slots.curse, 1)
            }, {
              // Curse #2.
              name: 'curse',
              id: 2,
              name_pretty: 'CURSE',
              slot: getSlotID(character.slots.curse, 2)
            }
          ]
        }
      ]
    }, {
      // Abilities.
      section: 'abilities',
      subsections: [
        {
          heading: 'abilities',
          banner: 'CHOOSE YOUR ABILITIES',
          tiles: [
            {
              // Ability #1.
              name: 'ability',
              id: 1,
              name_pretty: 'ABILITY',
              slot: getSlotID(character.slots.ability, 1)
            }, {
              // Ability upgrade #1.
              name: 'ability upgrade',
              id: 1,
              name_pretty: 'UPGRADE ABILITY',
              slot: getSlotID(character.slots.ability_upgrade, 1)
            }, {
              // Ability #2.
              name: 'ability',
              id: 2,
              name_pretty: 'ABILITY',
              slot: getSlotID(character.slots.ability, 2)
            }, {
              // Ability upgrade #2.
              name: 'ability upgrade',
              id: 2,
              name_pretty: 'UPGRADE ABILITY',
              slot: getSlotID(character.slots.ability_upgrade, 2)
            }, {
              // Ability #3.
              name: 'ability',
              id: 3,
              name_pretty: 'ABILITY',
              slot: getSlotID(character.slots.ability, 3)
            }, {
              // Ability upgrade #3.
              name: 'ability upgrade',
              id: 3,
              name_pretty: 'UPGRADE ABILITY',
              slot: getSlotID(character.slots.ability_upgrade, 3)
            }, {
              // Ability #4.
              name: 'ability',
              id: 4,
              name_pretty: 'ABILITY',
              slot: getSlotID(character.slots.ability, 4)
            }, {
              // Ability upgrade #4.
              name: 'ability upgrade',
              id: 4,
              name_pretty: 'UPGRADE ABILITY',
              slot: getSlotID(character.slots.ability_upgrade, 4)
            }
          ]
        }
      ]
    }
  ];
}


