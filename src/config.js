"use-strict";

/*
    All config variables exist: either in /config/[ default | ${NODE_ENV} ].yml file or as ENVIRONMENT variables.
    For sensitive config values, use ENVIRONMENT variables i.e credentials, api keys etc.
    Otherwise put them in the yml files as clear text.

    All config variables need to be declared and parsed in this file to ensure initialization.

    All config variables need to be referenced through this module rather than reading through process.env for example.
*/

// const jwk = require("../keys/jwk.json");

let envSource;
if (process.env.NODE_ENV !== "production") {
    envSource = require("dotenv").config().parsed;
} else {
    envSource = process.env;
}

var config = {};

config.app = {
    name: envSource.APP_NAME,
    app_deployment_type: envSource.APP_DEPLOYMENT_TYPE,
    app_routes_path: envSource.APP_ROUTES_PATH,
    app_page_path: envSource.APP_PAGES_PATH
};

config.parse = {
    url: envSource.PARSE_URL,
    port: envSource.PARSE_PORT,
    app_id: envSource.PARSE_APP_ID,
    master_key: envSource.PARSE_MASTER_KEY,
    readonly_master_key: envSource.PARSE_READONLY_MASTER_KEY,
    dashboard_trust_proxy: envSource.PARSE_DASHBOARD_TRUST_PROXY,
    verbose: envSource.PARSE_VERBOSE,
    env: envSource.PARSE_ENV,
    expire_inactive_sessions: envSource.PARSE_EXPIRE_INACTIVE_SESSIONS
};

config.database = {
    uri: envSource.DATABASE_URI,
    user: envSource.DATABASE_USER,
    password: envSource.DATABASE_PASSWORD,
    readonly_user: envSource.DATABASE_READONLY_USER,
    readonly_password: envSource.DATABASE_READONLY_PASSWORD
};

config.auth = {
    // jwks: jwk.keys,
    client_app_ids: envSource.CLIENT_APP_IDS.split(","),
    user_pool_ids: envSource.USER_POOL_IDS.split(","),
    api_admin_user: envSource.API_ADMIN_USER,
    api_admin_password: envSource.API_ADMIN_PASSWORD
};

module.exports = config;
