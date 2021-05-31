'use strict'

const {
    MongoClient
} = require('mongodb')

var state = {
    client: null
}

exports.connect = function(url, done) {
    if (state.client) return done()

    MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        function(err, client) {
            if (err) return done(err)
            state.client = client
            return done()
        })
}

exports.get = function() {
    return state.client
}

exports.close = function(done) {
    if (state.client) {
        state.client.close(function(err, result) {
            state.client = null
            done(err)
        })
    }
}