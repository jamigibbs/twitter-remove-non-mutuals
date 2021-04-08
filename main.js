const inquirer = require('inquirer');
const { getFollowers, getFriends, getToken } = require('./utils');

const questions = [{
  type: 'input',
  name: 'username',
  message: 'Enter the Twitter to use',
}];

async function main() {
  let friends = [];
  let followers = [];
  let cursorFriends = -1;
  let cursorFollowers = -1;

  try {
    const { username } = await inquirer.prompt(questions);
    const accessToken = await getToken();

    // For info about cursor, see https://developer.twitter.com/en/docs/basics/cursoring
    while (cursorFriends !== 0) {
      const friendsData = await getFriends(accessToken, username, cursorFriends);
      let cursorFriendsResult = friendsData.next_cursor;
      let friendsArray = friendsData.users;
      friends = friends.concat(friendsArray);
      cursorFriends = cursorFriendsResult;
    }

    while (cursorFollowers !== 0) {
      const followersData = await getFollowers(accessToken, username, cursorFollowers);
      let cursorFollowersResult = followersData.next_cursor;
      let followersArray = followersData.users;
      followers = followers.concat(followersArray);
      cursorFollowers = cursorFollowersResult;
    }

    console.log('followers', followers.length)

    // Compare followers and friends.
    const notFollowed = followers.filter((follower) => {
      const isMatch = friends.find((friend) => {
        return friend.screen_name === follower.screen_name;
      });

      if (!isMatch) return follower;
    });

    console.log('notFollowed', notFollowed.length);

    // Usernames as comma separate string.
    const usernamesToRemove = notFollowed.reduce((string, user) => {
      return string + `${user.screen_name},`
    }, '');

    console.log('usernamesToRemove', usernamesToRemove)

    // TODO: Block users in the not followed list.

    // TODO: Unblock users in the not followed list.


  } catch (err) {
    console.log('/// Main Error', err);
  }
}

main();
