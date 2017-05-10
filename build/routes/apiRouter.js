"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
exports.router = express.Router();
const session = require("express-session");
const models_1 = require("../models");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy((username, password, done) => {
    let user;
    models_1.User.findOne({ username: username })
        .exec()
        .then(_user => {
        user = _user;
        if (!user) {
            return done(null, false, { message: 'Incorrect username' });
        }
        return user.validatePassword(password);
    })
        .then(isValid => {
        if (!isValid) {
            return done(null, false, { message: 'Incorrect password' });
        }
        else {
            return done(null, user);
        }
    });
}));
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    models_1.User.findById(id, (err, user) => {
        done(err, user);
    });
});
//MIDDLEWARE
exports.router.use(session({ secret: 'mydogsnameisarden' }));
exports.router.use(passport.initialize());
exports.router.use(passport.session());
exports.router.get('/', (req, res) => {
    res.send("foodtracker API");
});
exports.router.post('/login', passport.authenticate('local'), (req, res) => {
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
    return models_1.User.find({ username: req.body.username })
        .count()
        .exec()
        .then(count => {
        if (count > 0) {
            return res.status(422).json({ message: 'Username already taken' });
        }
        return models_1.User.hashPassword(req.body.password);
    })
        .then(hash => {
        models_1.User.create({
            username: req.body.username,
            password: hash,
            name: {
                firstName: req.body.firstName,
                lastName: req.body.lastName
            }
        });
    })
        .then(user => res.status(201).json({ user }))
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
exports.router.get('/secrets', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    res.json({ message: 'secrets are here' });
});
