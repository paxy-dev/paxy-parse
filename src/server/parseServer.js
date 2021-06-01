const ParseServer = require("parse-server").ParseServer;
const ParseDashboard = require("parse-dashboard");
const S3Adapter = require("parse-server").S3Adapter;
const config = require("../../src/config");
const { buildSchemas } = require("./buildSchema");
const { User, Table, Field } = require("./schema");

const parseApiMountPath = "/parse";
const parseDashboardMountPath = "/dashboard";
const appName = config.app.name;
const expireInactiveSessions = config.parse.expire_inactive_sessions;

// parse server
function parseOptions() {
    let serverConfig = {
        appName: appName,
        appId: config.parse.app_id,
        masterKey: config.parse.master_key,
        readOnlyMasterKey: config.parse.readonly_master_key,
        databaseURI: config.database.uri,
        verbose: config.parse.verbose,
        serverURL: `http://localhost:${config.parse.port}` + parseApiMountPath,
        enableSingleSchemaCache: true, // for details see: https://github.com/parse-community/parse-server/issues/6061
        allowHeaders: ["X-Parse-Installation-Id"],
        expireInactiveSessions: expireInactiveSessions,
        serverStartComplete: async () => {
            await buildSchemas([User, Table, Field]);
        },
        logLevel: 'VERBOSE'
    };

    if (["production", "staging"].indexOf(config.parse.env) > -1) {
        // console.log(
        //     `Using AWS S3 as file adapter with region: ${config.aws.s3_region}, bucket: ${config.aws.s3_bucket}, base_url: ${config.aws.s3_base_url}`
        // );

        // let s3AdapterOptions = {
        //     region: config.aws.s3_region,
        //     directAccess: true
        // };
        // if (config.aws.s3_base_url) {
        //     s3AdapterOptions.baseUrl = config.aws.s3_base_url;
        //     s3AdapterOptions.baseUrlDirect = true;
        // }
        // serverConfig.filesAdapter = new S3Adapter(
        //     config.aws.s3_bucket,
        //     s3AdapterOptions
        // );
    }
    return serverConfig;
}

function useParseServer(app) {
    const api = new ParseServer({
        ...parseOptions(),
        // this will require cloud main module dynamically
        // register all cloud fn definition
        // verifyUserEmails: true,
        // emailAdapter: null
        // auth: {}
        // publicServerURL: ''
        cloud: __dirname + "/cloud/index",
        liveQuery: {}
    });
    app.use(parseApiMountPath, api);
    return app;
}

// parse server dashboard
function parseDashboardOptions() {
    const apps = [
        {
            ...parseOptions(),
            serverURL: config.parse.url + parseApiMountPath,
            production: true
        }
    ];
    const users = [
        {
            user: config.database.user,
            pass: config.database.password
        },
        {
            user: config.database.readonly_user,
            pass: config.database.readonly_password,
            readOnly: true
        }
    ];
    return {
        apps,
        users,
        trustProxy: 1
    };
}

function useLiveQueryServer(httpServer) {
    ParseServer.createLiveQueryServer(httpServer);
}

function useDashBoard(app) {
    const dashboard = new ParseDashboard(parseDashboardOptions());
    app.use(parseDashboardMountPath, dashboard);
    return app;
}

module.exports = {
    useDashBoard,
    useParseServer,
    useLiveQueryServer
};
