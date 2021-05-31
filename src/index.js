const config = require("../src/config");
const path = require("path");
const parseServer = require("parse-server").ParseServer;
const Parse = require("parse/node");
const parseApiMountPath = "/parse";
const { server, liveQueryServer } = require("./server/server");

let app = server();
let httpServer = require("http").createServer(app);
httpServer.listen(config.parse.port, () => {
    console.log(`# parse api running on url: ${config.parse.url}`);
    console.log(
        `# parse api mounted on server running on port ${config.parse.port}`
    );
});

liveQueryServer(httpServer);
