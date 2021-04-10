/* eslint-disable camelcase */
const consts = require('./constants');

/**
 * Returns an array of non-mutual usernames.
 * @param {array} friends
 * @param {array} followers
 */
function getNonMutualUsernames(friends, followers){
  const notFollowed = followers.filter((follower) => {
    const isMatch = friends.find((friend) => {
      return friend.screen_name === follower.screen_name;
    });
    if (!isMatch) return follower;
  });

  return notFollowed.map((user) => {
    return user.screen_name;
  });
}

/**
 * Converts millisecond to a human readable format.
 * https://stackoverflow.com/questions/19700283/how-to-convert-time-in-milliseconds-to-hours-min-sec-format-in-javascript/32180863#32180863
 * @param {number} ms
 */
function msToTime(ms) {
  let seconds = (ms / 1000).toFixed(1);
  let minutes = (ms / (1000 * 60)).toFixed(1);
  let hours = (ms / (1000 * 60 * 60)).toFixed(1);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (seconds < 60) return seconds + ' sec';
  else if (minutes < 60) return minutes + ' min';
  else if (hours < 24) return hours + ' hrs';
  else return days + ' days'
}

/**
 * Stops the server and exits terminal.
 * @param {string} message
 */
function handleExit(message){
  console.log(message);
  process.kill(process.pid, 'SIGTERM');
}

module.exports = {
  msToTime,
  getNonMutualUsernames,
  handleExit
};
