# Build a Spotify connected app with React

Demo here: <https://sporify-plus.herokuapp.com/>

## Spotify API and [Sporify developer console](https://developer.spotify.com/dashboard)

Authorization is asking for permission to do things. Authentication is about proving you are the correct person by providing credentials like a username or password.

## Roles

1. Resource Server: The API which stores data the application wants to access (Spotify API)
2. Resource Owner: Owns the data in the resource server (the user who wants to log into our app with Spotify is the owner of their Spotify account)
3. Client: The application that wants to access your data (our app)
4. Authorization Server: The server that receives requests from the client for access tokens and issues them upon successful authentication and consent by the resource owner (Spotify Accounts Service)

## Scopes

1. user-read-private
2. playlist-modify-private
3. user-follow-modify
4. user-read-collaborative
etc..

OAuth is an authorization protocol that lets you approve one application interacting with another on your behalf without giving away user credentials, like your username and password.

Instead of storing usernames and passwords in our app, we'll be using an access token that we obtain via OAuth to send authorized requests to the Spotify API and retrieve data.

## The OAuth Flow

Step 0. Client obtains client ID and client secret
Before any client or server requests are even made, there are two things the client (our app) needs in order to kick off the OAuth flow: the client ID and the client secret. These are two strings that are used to identify and authenticate your specific app when requesting an access token.
With Spotify, your app's unique client ID and client secret can be found in the developer dashboard.

Step 1. Client requests authorization to access data from Sporify
First, the client (our app) sends an authorization request containing the client ID and secret to the authorization server (the Spotify Accounts Service). This request also includes any scopes the client needs and a redirect URI which the authorization server should send the access token to.

Step 2. Spotify authorizes access to client
Second, the authorization server (Spotify) authenticates the client (our app) using the client ID and secret, then verifies that the requested scopes are permitted.

Step 3. User grants app access to their Spotify data
After step 2, the user is redirected to a page on the Spotify authorization server where they can grant the app access to their Spotify account. In our case, the user will have been sent to a page that belongs to the Spotify accounts service (note the accounts.spotify.com URL in the screenshot below), where they can log in to Spotify.

Step 4. Client receives access token from Spotify
Once the user grants access by logging into Spotify, the authorization server redirects the user back to the client (our app) with an access token. Sometimes, a refresh token is also returned with the access token.

Step 5. Client uses access token to request data from Spotify
Finally, the client can use the access token to access resources from the resource server (the Spotify API).

## Spotify's Authorization Flows

According to [Spotify's Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-flows), there are four possible flows for obtaining app authorization:

1. Authorization Code Flow
2. Authorization Code Flow With Proof Key for Code Exchange (PKCE)
3. Implicit Grant Flow
4. Client Credentials Flow

Each of these flows provides a slightly different level of authorization due to the way it is granted. For example, the Implicit Grant Flow can be implemented entirely client-side (no server), but it does not provide a refresh token. The Client Credentials Flow is used for server-to-server authentication, but authorization does not grant permission to access user resources. They all follow the OAuth flow we learned in the last lesson, but each has its own variation.

Out of all four of these flows, the Authorization Code Flow is the only one that lets the client access user resources, requires a server-side secret key (an extra layer of security), and provides an access token that can be refreshed. The ability to refresh an access token is a big advantage ??? users of our app will only need to grant permission once.

![Authorization code diagram](authorization-code-diagram.png)
<https://www.newline.co/courses/build-a-spotify-connected-app/implementing-the-authorization-code-flow>

![Response from Spotify callback]
{
  "country": "CA",
  "display_name": "username",
  "email": "email@gmail.com",
  "explicit_content": {
    "filter_enabled": false,
    "filter_locked": false
  },
  "external_urls": {
    "spotify": "https://open.spotify.com/user/username"
  },
  "followers": {
    "href": null,
    "total": 2
  },
  "href": "https://api.spotify.com/v1/users/username",
  "id": "username",
  "images": [],
  "product": "premium",
  "type": "user",
  "uri": "spotify:user:username"
}

## Local storage gameplan

We can store our tokens in local storage, a mechanism of the Web Storage API which lets us store key/value pairs in the browser.

Local storage is very similar to session storage, but there's a key difference between the two. Session storage only stores data for the duration of the page session, while local storage stores data even after the browser is closed. In simpler terms, local storage will let us store data in the browser for a particular domain and persist it, even when the user closes the tab or navigates away from our app.

Here's our gameplan for using local storage in our app:

When a user first visits our app, we'll prompt them to log in to Spotify, then store the access token and refresh token from the resulting URL query params in local storage.

Since we know that Spotify's access token will eventually expire after 3600 seconds (1 hour), we'll pre-emptively store a timestamp in local storage to keep track of when the tokens currently in use were stored.

Then, the next time we need to use the access token to make a request to the Spotify API, we'll first check if there is a timestamp and access token stored in local storage. If there is, we'll check if the token is still valid by determining if the amount of time that has elapsed between the timestamp being set and now is greater than 1 hour.

If the access token is still valid, we'll simply use that for our API request.

If the access token has expired, we'll use the refresh token we stored in local storage to request a new access token from Spotify behind the scenes using our Express app's /refresh_token endpoint. When we receive the new token, we'll store it in local storage along with an updated timestamp.

In a nutshell, our app will store four items in local storage:

- Spotify access token
- Spotify refresh token
- Spotify access token expire time (3600 seconds)
- Timestamp of when the access token currently in use was fetched and stored

Whenever our app needs to send a request to the Spotify API with an access token, we'll use the access token we stored in local storage. In the case the token has expired, we'll refresh it in the background using our refresh token from local storage.

Example for [playlist](https://api.spotify.com/v1/playlists/59ZbFPES4)

## Local Installation & Set Up

1. Register a Spotify App in your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) and add `http://localhost:8888/callback` as a Redirect URI in the app settings

2. Create a `.env` file at the root of the project based on `.env.example` and add your unique `CLIENT_ID` and `CLIENT_SECRET` from the Spotify dashboard

3. Ensure [nvm](https://github.com/nvm-sh/nvm) and [npm](https://www.npmjs.com/) are installed globally

4. Install the correct version of Node

    ```shell
    nvm install
    ```

5. Install dependencies

    ```shell
    npm install
    ```

6. Run the React app on <http://localhost:3000> and the Node server on <http://localhost:8888>

    ```shell
    npm start
    ```

# Deploying to Heroku

## Plan for deploying to [Heroku](https://dashboard.heroku.com/)

- [favicon generator](https://favicon.io/)
- update icons and manifest.json into client/public/favicon/ folder
- add fonts to folder client/public/fonts/ folder
- add metas, and links to icons and fonts into client/public/index.html file
- make configs for heroku deployment: You might be wondering why we've chosen Heroku to deploy our app instead of similar platforms like Netlify or Vercel. The short answer is that Heroku lets us deploy a Node server while the others don't ??? Netlify and Vercel are only for deploying static sites.
- update environment variables to .env.production and .env.development files
- add new Redirect URI to Spotify settings: <https://sporify-plus.herokuapp.com/callback>
- add environment variables to Heroku as same as for .env.production file, only REDIRECT_URI should be have links as for Spotify Redirect URI, and FRONTEND_URI to <https://sporify-plus.herokuapp.com>
- add build pack <https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-nodejs> to package.json

## Deploying to Heroku with Git

1. Create a [Heroku](https://www.heroku.com/) app

2. Add your Heroku app as a git remote

    ```shell
    heroku git:remote -a your-app-name
    ```

3. Add `http://your-app-name.herokuapp.com/callback` as a Redirect URI in your Spotify app's settings

4. In your app's **Settings** tab in the Heroku dashboard, add [config vars](https://devcenter.heroku.com/articles/config-vars#using-the-heroku-dashboard).

   Based on the values in your `.env` file, the `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URI`, and `FRONTEND_URI` key value pairs. Make sure to replace the `localhost` URLs with your heroku app's URL.

   ```env
   REDIRECT_URI: http://your-app-name.herokuapp.com/callback
   FRONTEND_URI: http://your-app-name.herokuapp.com
   ```

5. Push to Heroku

    ```shell
    git push heroku master
    ```

See the [Heroku docs](https://devcenter.heroku.com/articles/duplicate-build-version#diagnosing-deploying-from-a-different-branch) for more details on deploying from a working branch.

Heroku log shuld be look like that:
__________________________________________________________

remote: -----> Build succeeded!
remote: -----> Discovering process types
remote:        Procfile declares types -> web
remote:
remote: -----> Compressing...
remote:        Done: 73.3M
remote: -----> Launching...
remote:        Released v1
remote:        <https://sporify-plus.herokuapp.com/> deployed to Heroku
remote:
remote: Verifying deploy... done.
To <https://git.heroku.com/sporify-plus.git>
__________________________________________________________

Web Tools to test web-site:

- [SEO](https://metatags.io/)
- [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

Spotify recently introduced new changes to their developer platform where new third-party apps are automatically placed in "development mode". In development mode, up to 25 users can use your app ??? these users must be explicitly added under the section "Users and Access" before they can authenticate with your app.
So if you'd like to share your app with a friend and let them log in, you'll have to add them as a user in the dashboard first. If they are not added as a user, there will be a 403 error with the message "User not registered in the Developer Dashboard" when they try to log in.

For more information, read [Spotify's announcement](https://developer.spotify.com/community/news/2021/05/27/improving-the-developer-and-user-experience-for-third-party-apps/)

## What we learned

- What REST APIs are and how they work
- What OAuth is and how it works
- How to create a Node server with Express
- How to authorize a user with the Spotify API
- How to set up an efficient development workflow with client/server architecture
- How to use local storage to store authorization tokens
- How to fetch data from a third-party API in a React app
- How to set up routing in a React app with React Router
- How to handle asynchronous code with React Hooks and async/await
- How to efficiently style a React app with Styled Components
- How to deploy an app with a React front end and a Node.js back end to Heroku

## Technologies we used

- Node.js
- Express
- Create React App
- Styled Components
- Spotify API
- Heroku

Thank you so much to <https://twitter.com/bchiang7>
End product of the "Build a Spotify Connected App" newline course
<https://www.newline.co/courses/build-a-spotify-connected-app/>
