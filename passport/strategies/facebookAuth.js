//facebook authentication
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const FacebookAuthModel = require('../../models/facebookAuth.js');
const User = require('../../models/user.js');
const pick = require('lodash/pick');

module.exports = function() {

  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "https://vast-everglades-58513.herokuapp.com/socialAuth/facebook/callback",
      profileFields: ['id', 'emails', 'displayName'],
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, cb) {
      console.log('req', req);
      console.log('fb', profile);
      const { id, displayName, emails } = pick(profile, ['id', 'displayName', 'emails']);
      User.findOrCreate({ 'facebook.id': id, 'facebook.displayName': displayName, 'facebook.email': emails[0].value }, function (err, user) {
        console.log("logged in", user);
        return cb(err, user);
      });
    }
  ));

};
