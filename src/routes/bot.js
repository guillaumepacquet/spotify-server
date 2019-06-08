let request = require('request');

let bot_token = 'xoxb-9807265825-652578540292-SIJD9LF9FhkqxgqeVAtskigf';
let slack_acces_token = 'xoxp-9807265825-415390763814-653093778416-1fee1436553239b23141fdfe42da6cec';

exports.jukebot =  async (req, res) => {
    console.log('/jukebot request');
    let payload = req.body;
    if (req.body.challenge) {
        console.log('slack challenge check');
        res.status(200).send(req.body.challenge);
        return;
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
};
