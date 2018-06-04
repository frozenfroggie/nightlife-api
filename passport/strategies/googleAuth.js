//facebook authentication
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pick = require('lodash/pick');
const User = require('../../models/user.js');

module.exports = function() {

  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://vast-everglades-58513.herokuapp.com/socialAuth/google/callback",
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, cb) {
      console.log('req', req);
      console.log('google', profile);
      const { id, displayName, emails } = pick(profile, ['id', 'displayName', 'emails']);
      User.findOrCreate({ 'google.id': id, 'google.displayName': displayName, 'google.email': emails[0].value }, function (err, user) {
        console.log("logged in", user);
        return cb(err, user);
      });
    }
  ));

};
