'use strict';

const axios = require("axios");

const client_id = 'a3aa8fdb1b4446fe9ad5df68e3a77fb9';
const client_secret = '0d9964398b534e909eef74c6f8590263';

module.exports = class spotifyApi {
    constructor(store) {
        this.store = store;
    }

    async getPlaylists() {
        await this.refreshToken();

        return axios({
            method: 'get',
            url: 'https://api.spotify.com/v1/me/playlists',
            headers: { 'Authorization': 'Bearer ' + this.store.get('access_token') }
        });
    }

    async addTrackToPlaylist(playlist, track, position) {
        let params = { uris: track}

        if (position) params.position = position;

        await this.refreshToken();
        return axios({
            method: 'post',
            url: 'https://api.spotify.com/v1/playlists/' + playlist + '/tracks',
            headers: {
                'Authorization': 'Bearer ' + this.store.get('access_token')
             },
            params: params
        });
    }

    async getCurrentPlaying() {
        await this.refreshToken();

        return axios({
            method: 'get',
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: { 'Authorization': 'Bearer ' + this.store.get('access_token') },
            params: {
                market: 'NZ'
            }
        });
    }

    async getPlaylistTracks(playlist) {
        await this.refreshToken();

        return axios({
            method: 'get',
            url: 'https://api.spotify.com/v1/playlists/' + playlist + '/tracks',
            headers: { 'Authorization': 'Bearer ' + this.store.get('access_token') },
            params: {
                market: 'NZ'
            }
        });
    }

    async playNext() {
        await this.refreshToken();

        return axios({
            method: 'post',
            url: 'https://api.spotify.com/v1/me/player/next',
            headers: {
                'Authorization': 'Bearer ' + this.store.get('access_token')
             }
        });
    }

    async findTrack(search) {
        await this.refreshToken();
        
        return axios({
            method: 'get',
            url: 'https://api.spotify.com/v1/search', //CHECK
            headers: { 'Authorization': 'Bearer ' + this.store.get('access_token') },
            params: {
                q: search,
                type: 'track',
                limit: 5
            }
        });
    }

    async refreshToken() {
        let now = new Date();
        let expireAt = new Date(parseInt(this.store.get('expires_at'), 10));

        if (now < expireAt) {
            return;
        }

        let response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
             },
            params: {
                grant_type: 'refresh_token',
                refresh_token: this.store.get('refresh_token')
            }
        });

        this.store.set('access_token', response.data.access_token);
        let tokenExpireDate = new Date().getTime() + (response.data.expires_in * 1000);
        this.store.set('expires_at', tokenExpireDate);
    }
};
