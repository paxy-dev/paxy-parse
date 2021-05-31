const express = require('express');
const {
  MongoClient
} = require('mongodb');
const config = require('../src/config');
const {server, liveQueryServer} = require('../src/server/server');

const state = {
  app: null,
  client: null
};

function getApp() {
  if (state.app === null) {
    state.app = server();
  }
  return state.app;
}

function getDbName() {
  return 'local-dev'
}

async function getClient() {
  if (state.client === null) {
    state.client = await new Promise((resolve, reject) => {
      MongoClient.connect(config.database.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }, function(err, client) {
        if (err) reject(err);
        resolve(client)
      })
    });
  }
  return state.client;
}

function closeClient() {
  if (state.client !== null) {
    return new Promise((resolve, reject) => {
      state.client.close((err, results) => {
        if (err) reject(err);
        state.client = null;
        resolve(results);
      });
    })
  }
}

module.exports = {
  getApp,
  getClient,
  closeClient
};