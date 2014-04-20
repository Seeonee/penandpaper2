
// List of admin user IDs.
var admins = [
  'kevin@email.com'
];

MyAdmins = {
  isUserLoggedInAsAdmin: function(user) {
    console.log('isUserLoggedInAsAdmin starting');
    if (!user) {
      user = Meteor.user();
      if (user) {
        user = user.emails[0].address;
      }
    }
    console.log('isUserLoggedInAsAdmin returning');
    return user && _.contains(admins, user);
  }
};

