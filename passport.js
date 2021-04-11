const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const consts = require('./constants');

require('dotenv').config();

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new TwitterStrategy({
    consumerKey: process.env.CLIENT_KEY,
    consumerSecret: process.env.CLIENT_SECRET,
    callbackURL: `${consts.HOST}/auth/twitter/callback`,
  },

  function(accessToken, refreshToken, profile, done) {
    return done(null, profile, {accessToken, refreshToken});
  }));
