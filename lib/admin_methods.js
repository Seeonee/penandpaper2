
// List of admin user IDs.
var admins = [
  'kevin@email.com'
];

MyAdmins = {
  isUserLoggedInAsAdmin: function(user) {
    if (!user) {
      user = Meteor.user();
      if (user) {
        user = user.emails[0].address;
      }
    }
    return user && _.contains(admins, user);
  }
};

