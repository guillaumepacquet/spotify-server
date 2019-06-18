var express = require('express');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var slack = require('./src/routes/slack');
var web = require('./src/routes/web');
var bot = require('./src/routes/bot');

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser())
   .use(bodyParser.urlencoded({ extended: true}))
   .use(bodyParser.json());

const allowCrossDomain = function(req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', '*');
   res.header('Access-Control-Allow-Headers', '*');
   next();
}

app.use(allowCrossDomain)

app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/public/index.html');
})
app.get('/login', function (req, res, next) {
    res.sendFile(__dirname + '/public/index.html');
})
app.get('/register', function (req, res, next) {
    res.sendFile(__dirname + '/public/index.html');
})
app.post('/api/login', web.login);
app.post('/api/register', web.register);
app.get('/spotify-login', web.loginSpotify);
app.get('/callback', web.callback);
app.get('/refresh_token', web.refresh);
app.post('/jukebot', bot.jukebot);
app.post('/find', slack.find);
app.post('/actions', slack.actions);

let port = process.env.PORT;
if (port == null || port == "") {
    port = 8888;
}

app.listen(port);
console.log('Listening');
