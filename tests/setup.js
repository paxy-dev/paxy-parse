const config = require("../src/config");
const { MongoMemoryServer } = require("mongodb-memory-server");
const parseServer = require("parse-server");
const { server, liveQueryServer } = require("../src/server/server");
const http = require("http");
const { getApp, getClient, closeClient } = require("./utils");
const util = require("util");
const url = require("url");
const nock = require("nock");
const exec = util.promisify(require("child_process").exec);
const Parse = require("parse/node");
const { resolve } = require("path");
const { rejects } = require("assert");
const parseApiMountPath = "/parse";

let mongod;

const waitMongoStart = async function() {
    var db = null;
    while (db === null) {
        try {
            db = await getClient();
        } catch (e) {
            //
        }
    }
    await closeClient();
};

async function startMongo() {
    let dbUrl = url.parse(config.database.uri);
    mongod = new MongoMemoryServer({
        instance: {
            port: parseInt(dbUrl.port),
            ip: dbUrl.hostname,
            dbName: dbUrl.path.split("/").pop()
        },
        binary: {
            version: "4.2.0"
        }
    });
    await mongod.getConnectionString();
}

async function stopMongo() {
    await mongod.stop();
}

before(async function() {
    this.timeout(200000);
    await startMongo();
    const app = getApp();
    let httpServer = http.createServer(app);
    liveQueryServer(httpServer);

    const waitServerStart = async () => {
        return new Promise((resolve, _) => {
            httpServer.listen(config.parse.port, () => {
                console.log(`# parse api running on url: ${config.parse.url}`);
                console.log(
                    `# parse api mounted on server running on port ${config.parse.port}`
                );
                resolve();
            });
        });
    };

    const wait2000 = async () => {
        return new Promise((resolve, _) => {
            setTimeout(() => {
                resolve();
            }, 500);
        });
    };

    await waitServerStart();
    await wait2000();
    Parse.initialize(config.parse.app_id);
    Parse.masterKey = config.parse.master_key;
    Parse.serverURL = config.parse.url + parseApiMountPath;
});

after(async function() {
    this.timeout(20000);
    await stopMongo();
});
