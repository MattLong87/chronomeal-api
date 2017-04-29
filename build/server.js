"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var morgan = require("morgan");
var app = express();
app.use(morgan('common'));
app.get('/', function (req, res) {
    res.send("Hello again");
});
var port = 8080;
app.listen(port, function () {
    console.log("Your app is listening on port " + port);
});
