
// List of admin user IDs.
var admins = [
  'kevin@email.com'
];

Meteor.methods({
  // Function for testing if a user is logged in as admin.
  isUserLoggedInAsAdmin: function() {
    return Meteor.user() && _.contains(admins, Meteor.user().emails[0].address);
  }
});

