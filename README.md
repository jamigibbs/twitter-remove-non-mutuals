# Twitter Remove Non-Mutuals

This script will remove any non-mutuals from an authenticated Twitter account.

- [Standard Twitter API v1.1](https://developer.twitter.com/en/docs/twitter-api/v1)
- [Node](https://github.com/nodejs/node)
- [Express](https://github.com/expressjs/express)
- [Passport](http://www.passportjs.org/)

## How to use

This is an experimental script. If you'd like to use it for yourself, register an app in your [Twitter Developer dashboard](https://developer.twitter.com/en/portal/dashboard) for it and make note of the **API Key and Secret**. Give your app **Read and Write** permissions.

1. Clone this repository to your local machine and navigate to the project folder `cd twitter-remove-non-mutuals`.
2.  Rename the `.env-example` file to `.env` and update it with the API key and secret you saved when you created your app in your Twitter Developer dashboard.
3. `npm install`
4. `npm start`

## Rate Limiting Challenges

The endpoints used in this script are subject to a rate limit of 15 requests every 15 minutes (standard API). This creates quite a challenge for accounts with an even modest number of users to unfollow.

Because of this, the script will pause in 15 min intervals in order to avoid triggering the Twitter rate limit error response. This means that it might take some time to complete all of the unfollows.

An example scenario:

- 2000 followers = 20 requests (received in 200 count batches)
- 200 following = 1 request (received in one 200 count batch)
- 500 non-mutuals to unfollow = 1000 requests (one request to block and one request to unblock per user)

1021 total request = ~1021 minutes (17 hrs)

You can review Twitter's public rate limits below:

https://developer.twitter.com/en/docs/twitter-api/v1/rate-limits

## License

This project is licensed under [LGPL-3.0](https://choosealicense.com/licenses/lgpl-3.0/). Essentially, don't take this project and close source it.