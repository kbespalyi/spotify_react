require('dotenv').config({path: `.env.${process.env.NODE_ENV || 'development'}`})

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const FRONTEND_URI = process.env.FRONTEND_URI
const PORT = process.env.PORT || 8888

const express = require('express')
const querystring = require('querystring')
const axios = require('axios')
const path = require('path')

const app = express()

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, './app/build')))

const generateRandomString = (length) => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const stateKey = 'spotify_auth_state'

app.get('/login', (req, res) => {
  const state = generateRandomString(16)
  res.cookie(stateKey, state)
  
  const scope = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
  ].join(' ');

  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: scope,
  })

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`)
})

app.get('/callback', (req, res) => {
  const code = req.query.code || null

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    }
  })
  .then((response) => {
    if (response.status === 200) {

      const { access_token, refresh_token, expires_in } = response.data

      const queryParams = querystring.stringify({
        access_token,
        refresh_token,
        expires_in
      })

      res.redirect(`${FRONTEND_URI}/?${queryParams}`)

      /*
      axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `${token_type} ${access_token}`
        }
      })
      .then((response) => {
        res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`)
      })
      .catch((error) => {
        res.send(`Throw error: ${error.message}`)
      })
      */


    } else {
      res.redirect(`/?${querystring.stringify({ error: 'invalid_token' })}`)
    }
  })
  .catch((error) => {
    res.send(`Throw error: ${error.message}`)
  })
})

app.get('/refresh_token', (req, res) => {

  const { refresh_token } = req.query

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    }
  })
  .then((response) => {
    res.send(response.data)
  })
  .catch((error) => {
    res.send(`Throw error: ${error.message}`)
  })
})

// All remaining requests return the React app, so it can handle routing.
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './app/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`WebServer listening at http://localhost:${PORT}`)
})