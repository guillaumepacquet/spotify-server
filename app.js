/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var client_id = 'a3aa8fdb1b4446fe9ad5df68e3a77fb9'; // Your client id
var client_secret = '0d9964398b534e909eef74c6f8590263'; // Your secret
var redirect_uri = 'https://15aa6a7c.ngrok.io/callback'; // Your redirect uri

var bot_token = 'xoxb-9807265825-652578540292-SIJD9LF9FhkqxgqeVAtskigf';
var slack_acces_token = 'xoxp-9807265825-415390763814-653093778416-1fee1436553239b23141fdfe42da6cec';

var access_token = '';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser())
   .use(bodyParser.urlencoded({ extended: true}))
   .use(bodyParser.json());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
        console.log(options);

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

/******** Slack API ******/

app.post('/jukebot', (req, res) => {
    console.log('/jukebot request');
    let payload = req.body;
    if (req.body.challenge) {
        console.log('slack challeng check');
        res.status(200).send(req.body.challenge);
    }
    res.sendStatus(200);

    if (payload.event.type === "app_mention") {
        console.log('app mention');
        var authOptions = {
          url: 'https://slack.com/api/chat.postMessage',
          headers: {
              'Authorization': 'Bearer ' + bot_token,
              'Content-type': 'application/json'
          },
          form: {
            channel: 'jukebox',
            as_user: 'jukebot',
            text: 'hello world'
        },
          json: true
        };

        request.post(authOptions, function(err, resp, body) {
            console.log(err);
            console.log(resp.statusCode);
            console.log(body);
        });
    }
});

app.post('/find', (req, res) => {
    console.log('/find request');
    let payload = req.body;
    console.log(payload);
    var options = {
      url: 'https://api.spotify.com/v1/search',
      headers: { 'Authorization': 'Bearer ' + access_token },
      qs: {
          q: payload.text,
          type: 'track',
          limit: 5
      },
      json: true
    };
    console.log(options);

    // use the access token to access the Spotify Web API
    request.get(options, function(error, response, body) {
      console.log(body);
    });

    res.sendStatus(200);
});

console.log('Listening');

var port = process.env.PORT;
if (port == null || port == "") {
  port = 8888;
}

app.listen(port);
