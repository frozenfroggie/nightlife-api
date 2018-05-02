const express = require('express');
const router = express.Router();
const passport = require('passport');
const axios = require('axios');
const pick = require('lodash/pick');
const map = require('lodash/map');
const authenticate = require('../middleware/authenticate');
const User = require('../models/user');
// router.get('/github', function(req,res) {
//   res.redirect(`https://github.com/login/oauth/authorize?scope=user:email&client_id=${process.env.CLIENT_ID}&redirect_uri=https://vast-everglades-58513.herokuapp.com/auth/github/callback`);
// });
// router.get('/github/callback', function(req,response) {
//   const options = {'headers': {'Accept': 'application/json'}};
//   axios.post(`https://github.com/login/oauth/access_token?client_id=${process.env.CLIENT_ID}&redirect_uri=https://vast-everglades-58513.herokuapp.com&client_secret=${process.env.CLIENT_SECRET}&code=${req.query.code}`, options)
//        .then(res => {
//            axios.get(`https://api.github.com/user?${res.data}`).then(res => {
//              console.log(res.data);
//              response.send(res.data);
//            }).catch(err => {
//              console.log(err);
//            });
//        });
// });

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/' }));

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/' }));

router.get('/github', passport.authenticate('github'));
router.get('/github/callback', passport.authenticate('github', { successRedirect: '/', failureRedirect: '/' }));

router.get('/', function(req,res) {
  console.log('not authenticated')
  if(req.isAuthenticated()) {
    const { local, facebook, google, github, bars } = pick(req.user, ['bars', 'local', 'facebook', 'google', 'github']);
    res.send({isAuthenticated: true, user: {bars, local, facebook, google, github}});
  } else {
    res.send({isAuthenticated: false});
  }
});

router.get('/getAccounts', authenticate, function(req,res) {
    if(req.localUser && req.isAuthenticated()) {
      const localUser = req.localUser;
      const socialUser = req.user;
      let socialAccount;
      if(socialUser.facebook.id) {
        socialAccount = {account: socialUser.facebook, type: 'facebook'};
      } else if(socialUser.github.id) {
        socialAccount = {account: socialUser.github, type: 'github'};
      } else if(socialUser.google.id) {
        socialAccount = {account: socialUser.google, type: 'google'};
      }
      // bars = bars.filter( bar => {
      //   return localUser.bars && bars.forEach( localBar => {
      //     return bar.id !== localBar.id
      //   });
      // });
      User.findByIdAndRemove(socialUser._id).then(user => {
        console.log('Removed:', user);
      }).catch(err => res.status(400).send(err));

      User.findByIdAndUpdate(localUser._id, {$set: {[socialAccount.type]: socialAccount.account}}, {new: true}).then(user => {
        req.logout();
        res.send({ user });
      }).catch(err => res.status(400).send(err));

    } else {
      res.send({message: 'no social accounts to connect'});
    }
});

router.delete('/disconnect/:socialName', authenticate, function(req, res) {
  const socialName = req.params.socialName;
  User.findByIdAndUpdate(req.user._id, {$set: {[socialName]: {}}}, {new: true}).then(user => {
    console.log(user);
    res.send({ user });
  });
});

router.delete('/logout', function(req,res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
