// requests factory
const axios = require('axios');
const config = require('../src/config');

class RequestFactory {
    constructor(user = null) {
        this.user = user;
    }

    getDefaultHeaders() {
        const headers = {
            'X-Parse-Application-Id': config.parse.app_id,
            //'X-Parse-Master-Key': config.parse.master_key,
            'X-Parse-REST-API-Key': config.parse.master_key,
            'Content-Type': 'application/json'
        };
        if (this.user) {
            headers['X-Parse-Session-Token'] = this.user.getSessionToken();
        }
        return headers;
    }

    getUrl(name) {
        const root = config.parse.url;
        if (['/'].includes(name)) {
            const maps = {
                '/': '/',
            }
            return root + maps[name];
        } else if (name.startsWith('users/')) {
            return `${root}/parse/${name}`;
        } else {
            return `${root}/parse/functions/${name}`;
        }
    }

    create(name, method, data, headers = {}) {
        const defaultHeaders = this.getDefaultHeaders();
        return axios({
            method: method,
            url: this.getUrl(name),
            data,
            headers: {
                ...defaultHeaders,
                ...headers
            }
        })
    }
}

module.exports = {
    RequestFactory
};