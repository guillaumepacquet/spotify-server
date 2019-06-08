const SpotifyApi = require('./spotify-api');

module.exports = class actions {
    constructor(store) {
        this.store = store;
        this.spotify = new SpotifyApi(store);
    }

    async handleAction(action) {
        let status;

        switch (action.name) {
            case 'add':
                status = await this.addTrack(action.value);
                break;
            case 'play':
                status = await this.playTrack(action.value);
            default:
                status = false;
        }

        return status;
    }

    async addTrack(track) {
        let response = await this.spotify.getPlaylists();

        if (response === false) return false;

        let playlist = response.data.items[0].id;
        this.store.set('current_playlist_id', playlist);

        response =  await this.spotify.addTrackToPlaylist(playlist, track).catch((error) => {
            return false;
        });

        if (response === false) return false;

        return true;
    }

    async playTrack(track) {
        let response =  await this.spotify.getCurrentPlaying().catch((error) => {
            return false;
        });

        let trackId = response.data.item.id;

        response =  await this.spotify.getPlaylistTracks(this.store.get('current_playlist_id')).catch((error) => {
            return false;
        });

        let playlistTracks = response.data.items;

        let position = playlistTracks.findIndex(item => {
            return item.track.id === trackId;
        });
        position = position + 1;


        response =  await this.spotify.addTrackToPlaylist( this.store.get('current_playlist_id'), track, position).catch((error) => {
            return false;
        });

        response =  await this.spotify.playNext().catch((error) => {
            return false;
        });

        if (response === false) return false;

        return true;
    }
};
