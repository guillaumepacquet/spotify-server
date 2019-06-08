const Store = require('data-store');
const Actions = require('../actions');
const SpotifyApi = require('../spotify-api');

const store = new Store({ path: 'db.json' });
const actions = new Actions(store);
const spotify = new SpotifyApi(store);

exports.actions =  async (req, res) => {
    console.log('/actions request');
    let payload = JSON.parse(req.body.payload);

    let result = actions.handleAction(payload.actions[0]);

    if (result) {
        res.status(200).send('Song added');
    } else {
        res.status(500).send('something wrong');
    }
};

exports.find =  async (req, res) => {
    console.log('/find request');

    let result = await spotify.findTrack(req.body.text).catch((error) => {
        return false;
    });

    if (!result) {
        res.status(500).send('Something wrong happened');
        return false;
    }


    let respPayload = {
        response_type: "ephemeral",
        text: "Here what I've found",
        attachments: []
    };
    result.data.tracks.items.forEach(item => {
        let artists = item.artists.map(artist => artist.name);
        respPayload.attachments.push({
            "text": item.name +'\n'+ artists.join(' & '),
            "fallback": item.name + ' - ' + artists.join(' & '),
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "play",
                    "text": "Play Now",
                    "type": "button",
                    "value": item.uri
                },
                {
                    "name": "add",
                    "text": "Add to playlist",
                    "type": "button",
                    "value": item.uri
                }
            ]
        });
    });

    res.status(200).send(respPayload);
};
