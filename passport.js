const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

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
    callbackURL: 'http://www.localhost:8000/auth/twitter/callback',
  },

  function(accessToken, refreshToken, profile, done) {
    return done(null, profile, {accessToken, refreshToken});
  }));
