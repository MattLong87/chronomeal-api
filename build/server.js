"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const morgan = require("morgan");
const apiRouter_1 = require("./routes/apiRouter");
exports.app = express();
const config_1 = require("./config");
const mongoose = require("mongoose");
//use global promise instead of mongoose's
mongoose.promise = global.Promise;
exports.app.use(morgan('common'));
exports.app.use('/api', apiRouter_1.router);
let server;
function runServer(databaseUrl = config_1.DATABASE_URL, port = config_1.PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = exports.app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve(server);
            })
                .on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}
exports.runServer = runServer;
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}
exports.closeServer = closeServer;
if (require.main === module) {
    runServer().catch(err => console.error(err));
}
;
