let request = require('request');

let bot_token = '';
let slack_acces_token = '';

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
