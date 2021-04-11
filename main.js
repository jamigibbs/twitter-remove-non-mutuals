/* eslint-disable camelcase */
const Twitter = require('twit');
const inquirer = require('inquirer');
const open = require('open');
const Timer = require('tiny-timer');
const consts = require('./constants');
const { getFollowers, getFriends, blockUser, unblockUser } = require('./twitter-api');
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

  console.log(consts.STARTING_SCRIPT_MESSAGE);
  handleUnfollows(client, username);
  res.redirect('/');
});

const server = app.listen(8000, () => {
  console.log(consts.SERVER_RUNNING_MESSAGE);
});

process.on('SIGTERM', () => {
  server.close();
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

/**
 * This function will check how many API calls have been made so far
 * and pause the script until additional calls can be made (ie. 15 min).
 * Otherwise, the API will return a rate limit exceeded error.
 */
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
      }, consts.QUERY_LIMIT_WAIT_TIME);
    } else {
      resolve();
    }
  });
}

/**
 * After user authentication, this function will get the user's friends and followers,
 * determine which of those users are non-mutuals, and block/unblock them to force
 * an unfollow.
 * @param {object} client
 * @param {string} username
 */
async function handleUnfollows(client, username) {
  let friends = [], followers = [], cursorFriends = -1, cursorFollowers = -1;

  try {
    /**
     * Cursoring (paginating) the friends and follower requests. Twitter only allows 200
     * results per query. This will allow us to retrieve all of the users while also
     * keeping track of the number of queries we're making (to avoid rate limit exceeded error).
     * For more info about cursor, see https://developer.twitter.com/en/docs/basics/cursoring
     */
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

    /**
     * Extracting the usernames of non-mutuals.
     */
    const unfollows = getNonMutualUsernames(friends, followers);

    if (unfollows && unfollows.length > 0 ) {
      console.log(`You are about to remove ${unfollows.length} non-mutual(s) from your account.`);
      const { remove } = await inquirer.prompt(questions);

      // Confirming unfollow action before executing.
      if (remove.toLowerCase() === 'yes') {
        unfollows.forEach(async (unfollow) => {
          await blockUser(client, unfollow);
          await queryLimitCheck();
          await unblockUser(client, unfollow);
          console.log(`Removed ${unfollow}`);
          await queryLimitCheck();
        });
        handleExit(consts.COMPLETED_MESSAGE);
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
