"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
//use global promise instead of mongoose's
mongoose.promise = global.Promise;
const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    name: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true }
    },
    meals: [
        {
            time: String,
            food: String,
            notes: String,
            pain: Number
        }
    ]
});
exports.User = mongoose.model('User', userSchema);
