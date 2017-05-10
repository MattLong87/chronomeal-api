"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
//use global promise instead of mongoose's
mongoose.Promise = global.Promise;
const bcrypt = require("bcrypt");
const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
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
userSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
};
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};
exports.User = mongoose.model('User', userSchema);
