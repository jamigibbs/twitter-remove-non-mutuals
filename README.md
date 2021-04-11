# Twitter Remove Non-Mutuals

This script will remove any non-mutuals (users that follow you but you do not follow in return) from an authenticated Twitter account.

- [Standard Twitter API v1.1](https://developer.twitter.com/en/docs/twitter-api/v1)
- [Twitter OAuth 1.0a](https://developer.twitter.com/en/docs/authentication/oauth-1-0a)
- [Node](https://github.com/nodejs/node)
- [Express](https://github.com/expressjs/express)
- [Passport](http://www.passportjs.org/)

## How to use

This is an experimental script. If you'd like to use it for yourself, register an app in your [Twitter Developer dashboard](https://developer.twitter.com/en/portal/dashboard) for it and make note of the **API Key and Secret**. Give your app **Read and Write** permissions.

1. Clone this repository to your local machine and navigate to the project folder `cd twitter-remove-non-mutuals`.
2.  Rename the `.env-example` file to `.env` and update it with the API key and secret you saved when you created your app in your Twitter Developer dashboard.
3. `npm install`
4. `npm start`

## Rate Limit Challenges

The endpoints used in this script are subject to a rate limit of 15 requests every 15 minutes (Standard Twitter API). This creates quite a challenge for accounts with just a modest number of users to query and unfollow.

Because of these rate limits, the script will pause in 15 min intervals in order to avoid triggering the Twitter rate limit error response. This means that it might take some time to complete all of the unfollows.

An example scenario:

- 1000 followers = 5 requests (received in 200 count batches)
- 1000 following = 5 request (received in 200 count batches)
- 500 non-mutuals to unfollow = 1000 requests (one request to block and one request to unblock per user)

1010 total requests = ~1010 minutes (16.8 hrs)

You can review Twitter's Standard API public rate limits below:

https://developer.twitter.com/en/docs/twitter-api/v1/rate-limits

## License

This project is licensed under [LGPL-3.0](https://choosealicense.com/licenses/lgpl-3.0/). Essentially, don't take this project and close source it.