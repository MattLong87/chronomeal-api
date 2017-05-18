"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
exports.router = express.Router();
const session = require("express-session");
const models_1 = require("../models");
const passport_1 = require("passport");
const LocalStrategy = require('passport-local').Strategy;
passport_1.passport.use(new LocalStrategy((username, password, done) => {
    models_1.User.findOne({ username: username }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'Incorrect username' });
        }
        if (!user.validPassword(password)) {
            return done(null, false, { message: 'Incorrect password' });
        }
        return done(null, user);
    });
}));
//MIDDLEWARE
exports.router.use(session({ secret: 'mydogsnameisarden' }));
exports.router.use(passport_1.passport.initialize());
exports.router.use(passport_1.passport.session());
exports.router.get('/', (req, res) => {
    res.send("foodtracker API");
});
exports.router.post('/login', passport_1.passport.authenticate('local'), (req, res) => {
    res.json({ message: "login successful" });
});
//GET a user's information
exports.router.get('/users/me', (req, res) => {
    models_1.User.findOne()
        .exec()
        .then(user => {
        res.json(user);
    })
        .catch(err => {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    });
});
//POST to create a new user
exports.router.post('/users', (req, res) => {
    models_1.User.create({
        username: req.body.username,
        name: {
            firstName: req.body.firstName,
            lastName: req.body.lastName
        }
    })
        .then(user => res.status(201).json(user))
        .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    });
});
//POST to add a meal
exports.router.post('/users/me/add-meal', (req, res) => {
    let newMeal = {
        time: req.body.time,
        food: req.body.food,
        notes: req.body.notes,
        pain: req.body.pain
    };
    models_1.User.findOneAndUpdate({ username: req.body.username }, { $push: { meals: newMeal } }, { new: true })
        .exec()
        .then((user) => {
        res.status(201).json(user);
    });
});
//DELETE a specific meal by ID
exports.router.delete('/users/me/meals', (req, res) => {
    models_1.User.update({ username: req.body.username }, { $pull: { meals: { _id: req.body.mealId } } })
        .exec()
        .then(() => res.status(204).end());
});
