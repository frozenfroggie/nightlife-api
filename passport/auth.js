const mongoose = require("mongoose");
const User = require('../models/user.js');
const passport = require('passport');

module.exports = function(app) {

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => {
      done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
      User.findById({_id: new mongoose.mongo.ObjectId(id)}, function(err, user) {
          if(err) return done(err);
          if(user) {
            done(null, user);
          }
        });
    });

};
