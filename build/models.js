"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
//use global promise instead of mongoose's
mongoose.Promise = global.Promise;
const bcrypt = require("bcryptjs");
const userSchema = mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    created: { type: Number, required: true },
    token: { type: String },
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
userSchema.statics.hashPassword = function (password, cb) {
    return bcrypt.hash(password, 10, cb);
};
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};
userSchema.statics.generateToken = function () {
    const buffer = require('crypto').randomBytes(26);
    return buffer.toString('hex');
};
userSchema.pre('save', function (next) {
    if (this.isNew) {
        return require('crypto').randomBytes(26, (err, buffer) => {
            var token = buffer.toString('hex');
            this.token = token;
            next();
        });
    }
    next();
});
userSchema.methods.apiRepr = function () {
    return {
        email: this.email,
        name: this.name,
        meals: this.meals,
        token: this.token
    };
};
exports.User = mongoose.model('User', userSchema);
