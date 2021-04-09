/* eslint-disable function-paren-newline */
/* eslint-disable camelcase */
const Twitter = require('twit');
const inquirer = require('inquirer');
const open = require('open');
const { getFollowers, getFriends } = require('./utils');
const cookieSession = require('cookie-session')
const passport = require('passport');
require('./passport')

require('dotenv').config();

const express = require('express')
const app = express()

// const questions = [{
//   type: 'input',
//   name: 'username',
//   message: 'Enter Twitter username',
// }];

app.use(cookieSession({
  name: 'twitter-auth-session',
  signed: false
}))

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (_req, res) => {
  res.send(`Thank you! You've been verified! You can close this window.`);
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/auth/error' }),
function(req, res) {

  const username = req.user.username;
  const oauthVerifier = req.query.oauth_verifier;
  const oauthToken = req.query.oauth_token;
  const accessToken = req.authInfo.accessToken;
  const refreshToken = req.authInfo.refreshToken;

  const client = new Twitter({
    consumer_key:         process.env.CLIENT_KEY,
    consumer_secret:      process.env.CLIENT_SECRET,
    access_token:         accessToken,
    access_token_secret:  refreshToken
  });

  handleUnfollows(client, username);

  res.redirect('/');
});

app.listen(8000, () => {
  console.log('Server is up and running on port 8000')
});

function startScript() {
  open('http://www.localhost:8000/auth/twitter');
}

async function handleUnfollows(client, username) {
  let friends = [];
  let followers = [];
  let cursorFriends = -1;
  let cursorFollowers = -1;

  try {
    // const { username } = await inquirer.prompt(questions);

    // TODO: Optimize for rate limiting. ie. 1 call every 61 seconds?

    // For info about cursor, see https://developer.twitter.com/en/docs/basics/cursoring
    while (cursorFriends !== 0) {
      const friendsData = await getFriends(client, username, cursorFriends);
      const friendsArray = friendsData.users;
      friends = friends.concat(friendsArray);
      cursorFriends = friendsData.next_cursor;
    }

    while (cursorFollowers !== 0) {
      const followersData = await getFollowers(client, username, cursorFollowers);
      let followersArray = followersData.users;
      followers = followers.concat(followersArray);
      cursorFollowers = followersData.next_cursor;
    }

    // Compare followers and friends.
    const notFollowed = followers.filter((follower) => {
      const isMatch = friends.find((friend) => {
        return friend.screen_name === follower.screen_name;
      });

      if (!isMatch) return follower;
    });

    // Usernames as comma separate string.
    const usernamesToRemove = notFollowed.map((user) => {
      return user.screen_name;
    });

    // TODO: Block users in the not followed list.

    // TODO: Unblock users in the not followed list.


  } catch (err) {
    console.log('/// Main Error', err);
  }
}

startScript();
