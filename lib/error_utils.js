/*
 * Error handling utils.
 */

ErrorUtils = {
  // Take a string like "Error: Character name 'Skeeball' already exists [403]",
  // and return just the message.
  extract: function(err) {
    try {
      return err.replace(/Error: (.*) \[\d+\]/, '$1');
    } catch (e) {
      return err;
    }
  }
};

