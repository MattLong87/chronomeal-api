"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const morgan = require("morgan");
const apiRouter_1 = require("./routes/apiRouter");
exports.app = express();
exports.app.use(morgan('common'));
exports.app.use('/api', apiRouter_1.router);
let server;
function runServer() {
    const port = 8080;
    return new Promise((resolve, reject) => {
        server = exports.app.listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve(server);
        }).on('error', err => {
            reject(err);
        });
    });
}
exports.runServer = runServer;
function closeServer() {
    return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
exports.closeServer = closeServer;
if (require.main === module) {
    runServer().catch(err => console.error(err));
}
;
