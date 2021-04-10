/* eslint-disable camelcase */
const Twitter = require('twit');
const inquirer = require('inquirer');
const open = require('open');
const Timer = require('tiny-timer');
const consts = require('./constants');
const { getFollowers, getFriends, blockUser, unblockUser } = require('./utils-twitter');
const { msToTime, getNonMutualUsernames, handleExit } = require('./utils');
const cookieSession = require('cookie-session');
const passport = require('passport');
require('./passport')

require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();

app.use(cookieSession({
  name: 'twitter-auth-session',
  signed: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '/view/auth-confirm.html'));
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/error', (_req, res) => {
  res.sendFile(path.join(__dirname, '/view/auth-failed.html'));
});

app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/auth/error' }), (req, res) => {
  const username = req.user.username;
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

const server = app.listen(8000, () => {
  console.log(consts.SERVER_RUNNING_MESSAGE);
});

process.on('SIGTERM', () => {
  server.close(() => { console.log(consts.SERVER_CLOSED_MESSAGE) });
});

const timer = new Timer({ 
  interval: consts.STOPWATCH_INTERVAL,
  stopwatch: true
});

const questions = [{
  type: 'input',
  name: 'remove',
  message: consts.ARE_YOU_SURE_YES_NO,
}];

function startScript() {
  open(`${consts.HOST}/auth/twitter`);
}

let queryCount = 0;

const queryLimitCheck = () => {
  return new Promise(function(resolve, reject) {
    queryCount++;
    if (queryCount >= 15) {
      // Reset the query count for the next 15 minute batch.
      queryCount = 0;

      console.log(consts.HIT_QUERY_LIMIT);
      console.log(consts.TIMER_STARTED);

      timer.start(consts.QUERY_LIMIT_WAIT_TIME);
      timer.on('tick', (ms) => console.log(consts.TIME_ELAPSED_LABEL, msToTime(ms)));

      setTimeout(() => {
        resolve();
      }, consts.QUERY_LIMIT_WAIT_TIME); // 15.1 min.
    } else {
      resolve();
    }
  });
}

async function handleUnfollows(client, username) {
  let friends = [];
  let followers = [];
  let cursorFriends = -1;
  let cursorFollowers = -1;

  try {
    // For info about cursor, see https://developer.twitter.com/en/docs/basics/cursoring
    while (cursorFriends !== 0) {
      const friendsData = await getFriends(client, username, cursorFriends);
      const friendsArray = friendsData.users;
      friends = friends.concat(friendsArray);
      await queryLimitCheck();
      cursorFriends = friendsData.next_cursor;
    }

    while (cursorFollowers !== 0) {
      const followersData = await getFollowers(client, username, cursorFollowers);
      const followersArray = followersData.users;
      followers = followers.concat(followersArray);
      await queryLimitCheck();
      cursorFollowers = followersData.next_cursor;
    }

    const unfollows = getNonMutualUsernames(friends, followers);

    if (unfollows && unfollows.length > 0 ) {
      console.log(`You are about to remove ${unfollows.length} non-mutual(s) from your account.`);
      const { remove } = await inquirer.prompt(questions);
      const removeAuth = remove.toLowerCase();

      if (removeAuth === 'yes') {
        unfollows.forEach(async (unfollow) => {
          await blockUser(client, unfollow);
          await queryLimitCheck();
          await unblockUser(client, unfollow);
          await queryLimitCheck();

          handleExit(consts.COMPLETED_MESSAGE);
        });
      } else {
        handleExit(consts.UNFOLLOW_AUTH_NOT_RECEIVED);
      }
    } else {
      handleExit(consts.NO_UNFOLLOWS_AVAILABLE);
    }

  } catch (err) {
    if (err.statusCode === 429) {
      handleExit(consts.RATE_LIMIT_EXCEEDED);
    } else {
      console.log('/// Error', err);
      handleExit(consts.GENERAL_ERROR_MESSAGE);
    }
  }
}

startScript();
