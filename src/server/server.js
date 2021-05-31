const express = require("express");
const db = require("./db");
const config = require("../../src/config");
const serverRouter = require("./routes/Server");
const {
    useParseServer,
    useDashBoard,
    useLiveQueryServer
} = require("./parseServer");

function server() {
    db.connect(config.database.uri, function(err) {
        if (err) {
            console.error("Unable to connect to Mongo.");
            process.exit(1);
        }
    });

    let app = express();

    app = useParseServer(app);
    app = useDashBoard(app);
    app.use(serverRouter);
    app.use(function(err, req, res, next) {
        console.error("Error from http route - " + err);
        res.status(err.status || 500);
        res.send(err.message);
    });
    return app;
}

function liveQueryServer(httpServer) {
    useLiveQueryServer(httpServer);
}

module.exports = {
    server,
    liveQueryServer
};
