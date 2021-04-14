# Twitter Remove Non-Mutuals

This script will remove any non-mutuals (users that follow you but you do not follow in return) from an authenticated Twitter account.

- [Standard Twitter API v1.1](https://developer.twitter.com/en/docs/twitter-api/v1)
- [Twitter OAuth 1.0a](https://developer.twitter.com/en/docs/authentication/oauth-1-0a)
- [Node](https://github.com/nodejs/node)
- [Express](https://github.com/expressjs/express)
- [Passport](http://www.passportjs.org/)

### Use Case

The primary use case for removing non-mutuals is when you've changed your account from public to private and would like to remove followers who had followed your account while it was public. With a private account, followers need to request permission to follow before they can view your tweets. Twitter does not automatically remove non-mutuals for you if you decide to go private.

## How to use

This is an experimental script. If you'd like to use it for yourself, first acknowledge that I make no guarantee of its reliability.

Next register an app in your [Twitter Developer dashboard](https://developer.twitter.com/en/portal/dashboard) for it and make note of the **API Key and Secret**. Give your app **Read and Write** permissions.

In your registered app under the **Edit authentication settings**, update the following:

- Turn on **Enable 3-legged OAuth**
- Add the following **Callback URLs**: http://www.localhost:8000/auth/twitter/callback
- Add the following **Website URL**: http://www.localhost:8000

1. Clone this repository to your local machine and navigate to the project folder `cd twitter-remove-non-mutuals`.
2.  Rename the `.env-example` file to `.env` and update it with the API key and secret you saved when you created your app in your Twitter Developer dashboard.
3. `npm install`
4. `npm start`

## Rate Limit Challenges

The endpoints used in this script appear to be subject to a rate limit of 15 requests every 15 minutes (Standard Twitter API). The block and unblock rate limits are not public though. This could create a challenge for accounts with a large number of users to query and unfollow.

Because of these rate limits, the script will attempt to pause in 15 min intervals in order to avoid triggering an error response. This means that it might take some time to complete all of the unfollows.

You can review Twitter's Standard API public rate limits below:

https://developer.twitter.com/en/docs/twitter-api/v1/rate-limits

## License

This project is licensed under [LGPL-3.0](https://choosealicense.com/licenses/lgpl-3.0/). Essentially, don't take this project and close source it.