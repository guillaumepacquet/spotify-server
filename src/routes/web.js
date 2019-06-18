const request = require('request'); // "Request" library
const querystring = require('querystring');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Store = require('data-store');
const store = new Store({ path: 'db.json' });

const client_id = process.env.SPOTIFY_APP_ID; // Your client id
const client_secret = process.env.SPOTIFY_APP_SECRET; // Your secret
const app_secret = process.env.APP_SECRET;
const redirect_uri = 'https://sortify-jukebox.herokuapp.com/callback'; // Your redirect uri
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

exports.register = function(req, res) {
    let user = store.get('user_username');

    if (user) {
        return res.status(500).send('No more user');
    }
    store.set('user_password', bcrypt.hashSync(req.body.password, 8));
    store.set('user_username', req.body.username);
    let token = jwt.sign({ id: req.body.username }, app_secret, { expiresIn: 86400 }); // expires in 24 hours

    res.status(200).send({ auth: true, token: token, user: req.body.username });
};

exports.login = function(req, res) {
    let password = store.get('user_password');
    let user = store.get('user_username');
    if (user !== req.body.username) return res.status(404).send('No user found.');

    let passwordIsValid = bcrypt.compareSync(req.body.password, password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
    let token = jwt.sign({ id: user }, app_secret, { expiresIn: 86400 }); // expires in 24 hours

    res.status(200).send({ auth: true, token: token, user: user });
};

exports.loginSpotify = function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  const USER_READ_CURRENTLY_PLAYING = 'user-read-currently-playing';
  const USER_READ_PRIVATE = 'user-read-private'; //NO USE
  const USER_READ_EMAIL = 'user-read-email'; //NO USE
  // const USER_READ_PLAYBACK_STATE = 'user-read-playback-state';
  const USER_MODIFY_PLAYBACK_STATE = 'user-modify-playback-state'
  const PLAYLIST_MODIFY_PRIVATE = 'playlist-modify-private';
  const PLAYLIST_MODIFY_PUBLIC = 'playlist-modify-public';
  const PLAYLIST_READ_PRIVATE = 'playlist-read-private';

  // your application requests authorization
  var scope =
            USER_READ_CURRENTLY_PLAYING + ' ' +
            USER_READ_PRIVATE + ' ' +
            USER_READ_EMAIL + ' ' +
            PLAYLIST_MODIFY_PRIVATE + ' ' +
            PLAYLIST_MODIFY_PUBLIC + ' ' +
            PLAYLIST_READ_PRIVATE + ' ' +
            USER_MODIFY_PLAYBACK_STATE
  ;
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
};

exports.callback = function(req, res) {

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
        access_token = body.access_token;
        refresh_token = body.refresh_token;

        store.set('access_token', body.access_token);
        store.set('refresh_token', body.refresh_token);
        let tokenExpireDate = new Date().getTime() + (body.expires_in * 1000);
        store.set('expires_at', tokenExpireDate);

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          // console.log(body);
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
};

exports.refresh = function(req, res) {
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
      store.set('access_token', body.access_token);
      let tokenExpireDate = new Date().getTime() + (body.expires_in * 1000);
      store.set('expires_at', tokenExpireDate);
      res.send({
        'access_token': access_token
      });
    }
  });
};
