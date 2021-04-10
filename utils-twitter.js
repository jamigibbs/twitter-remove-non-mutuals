
/**
 * Returns a cursored collection of users that the provided username follows.
 * The maximum number of users to return per page is 200.
 * Each page will count against the rate limit.
 * @param {object} client
 * @param {string} username
 * @param {number} cursor
 */
async function getFriends(client, username, cursor) {
  try {
    const { data } = await client.get('friends/list', {
      screen_name: username,
      cursor: cursor,
      count: 200,
      skip_status: true,
      skip_user_entities: true
    })
    return data;
  } catch (err) {
    throw err;
  }
}

/**
 * Returns a cursored collection of followers for the provided username.
 * The maximum number of users to return per page is 200.
 * Each page will count against the rate limit.
 * @param {object} client
 * @param {string} username
 * @param {number} cursor
 */
async function getFollowers(client, username, cursor) {
  try {
    const { data } = await client.get('followers/list', {
      screen_name: username,
      cursor: cursor,
      count: 200,
      skip_status: true,
      skip_user_entities: true
    })
    return data;
  } catch (err) {
    throw err;
  }
}

async function blockUser(client, username) {
  try {
    const { data } = await client.post('blocks/create', {
      screen_name: username
    });
    return data;
  } catch (err) {
    throw err
  }
}

async function unblockUser(client, username) {
  try {
    const { data } = await client.post('blocks/destroy', {
      screen_name: username
    });
    return data;
  } catch (err) {
    throw err
  }
}

module.exports = {
  getFriends,
  getFollowers,
  blockUser,
  unblockUser
};
