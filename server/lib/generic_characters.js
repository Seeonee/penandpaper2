/*
 * Server-side methods for working with generic characters.
 */

GenericCharacters = {};

// These are the fields that a character database
// should publish to the client.
GenericCharacters.publish_fields = {
  name: 1, 
  level: 1,
  points: 1,
  points_spent: 1,
  attributes: 1,
  devotions: 1,
  skills: 1,
  slots: 1,
  
  owner: 1, 
  created: 1,
  last_modified_on: 1
};

