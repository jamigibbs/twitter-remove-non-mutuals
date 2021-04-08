/* eslint-disable camelcase */
const axios = require('axios');
const { Base64 } = require('js-base64');
require('dotenv').config();

// Authenticate Client and get Bearer
async function getToken() {
  try {
    const { data } = await axios({
      url: 'https://api.twitter.com/oauth2/token?grant_type=client_credentials',
      method: 'post',
      headers: {
        Authorization: 'Basic ' + Base64.encode(`${process.env.CLIENT_KEY}:${process.env.CLIENT_SECRET}`),
      },
    });
    return data.access_token
  } catch (err) {
    throw(err);
  }
}

// Returns a list of users this username follows
async function getFriends(accessToken, username, cursor) {
  try {
    const { data } = await axios({
      url: `https://api.twitter.com/1.1/friends/list.json`,
      params: {
        cursor: cursor,
        screen_name: username,
        count: 200,
        skip_status: true,
        skip_user_entities: true,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
    });
    return data;
  } catch (err) {
    throw err;
  }
}

// Returns a list of users who follow the provided username
async function getFollowers(accessToken, username, cursor) {
  try {
    const { data } = await axios({
      url: 'https://api.twitter.com/1.1/followers/list.json',
      params: {
        screen_name: username,
        cursor: cursor,
        count: 200,
        skip_status: true,
        skip_user_entities: true,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
    return data;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getFriends,
  getFollowers,
  getToken
};
