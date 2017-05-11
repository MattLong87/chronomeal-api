"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
exports.router = express.Router();
const session = require("express-session");
const models_1 = require("../models");
const passport = require("passport");
const passport_local_1 = require("passport-local");
passport.use(new passport_local_1.Strategy((username, password, done) => {
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
        done(err, user.apiRepr());
    });
});
//MIDDLEWARE
exports.router.use(session({
    secret: 'mydogsnameisarden',
    resave: false,
    saveUninitialized: false
}));
exports.router.use(passport.initialize());
exports.router.use(passport.session());
exports.router.get('/', (req, res) => {
    res.send("foodtracker API");
});
exports.router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({ message: "login successful" });
});
//GET a user's information
exports.router.get('/users/me', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    //user is attached to request object by passport.deserializeUser
    res.send(req.user);
});
//POST to create a new user
exports.router.post('/users', (req, res) => {
    //verify required fields are present
    const requiredFields = ["username", "password", "email", "firstName", "lastName"];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!req.body[field]) {
            return res.json({ message: `Missing field: ${field}` });
        }
    }
    models_1.User.find({ username: req.body.username })
        .count()
        .exec()
        .then(count => {
        if (count > 0) {
            return res.status(422).json({ message: 'Username already taken' });
        }
        return models_1.User.hashPassword(req.body.password);
    })
        .then(hash => {
        return models_1.User.create({
            username: req.body.username,
            password: hash,
            email: req.body.email,
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
exports.router.post('/users/me/add-meal', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    //verify required fields are present
    const requiredFields = ["time", "food", "notes", "pain"];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!req.body[field]) {
            return res.json({ message: `Missing field: ${field}` });
        }
    }
    let newMeal = {
        time: req.body.time,
        food: req.body.food,
        notes: req.body.notes,
        pain: req.body.pain
    };
    models_1.User.findOneAndUpdate({ username: req.user.username }, { $push: { meals: newMeal } }, { new: true })
        .exec()
        .then((user) => {
        res.status(201).json(user.apiRepr());
    });
});
//DELETE a specific meal by ID
exports.router.delete('/users/me/meals', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    //verify required fields are present
    const requiredFields = ["mealId"];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!req.body[field]) {
            return res.json({ message: `Missing field: ${field}` });
        }
    }
    models_1.User.update({ username: req.user.username }, { $pull: { meals: { _id: req.body.mealId } } })
        .exec()
        .then(() => res.status(204).end());
});
