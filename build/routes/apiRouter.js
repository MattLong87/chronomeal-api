"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
exports.router = express.Router();
const models_1 = require("../models");
const passport = require("passport");
const passport_local_1 = require("passport-local");
const passport_http_bearer_1 = require("passport-http-bearer");
passport.use(new passport_local_1.Strategy({ usernameField: 'email' }, (email, password, done) => {
    let user;
    models_1.User.findOne({ email: email })
        .exec()
        .then(_user => {
        user = _user;
        if (!user) {
            return done(null, false, { message: 'Email not found' });
        }
        return user.validatePassword(password);
    })
        .then(isValid => {
        if (!isValid) {
            return done(null, false, { message: 'Incorrect password' });
        }
        else {
            user.token = models_1.User.generateToken();
            user.save((err, updatedUser) => {
                return done(null, updatedUser);
            });
        }
    });
}));
passport.use(new passport_http_bearer_1.Strategy(function (token, done) {
    models_1.User.findOne({ token: token }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false);
        }
        return done(null, user, { scope: 'all' });
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
exports.router.use(passport.initialize());
exports.router.get('/', (req, res) => {
    res.send("foodtracker API");
});
exports.router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
});
//GET a user's information
exports.router.get('/users/me', passport.authenticate('bearer', { session: false }), (req, res) => {
    //user is attached to request object by passport.deserializeUser
    res.send(req.user);
});
//POST to create a new user
exports.router.post('/users', (req, res) => {
    //verify required fields are present
    const requiredFields = ["password", "email", "firstName", "lastName"];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!req.body[field]) {
            return res.json({ message: `Missing field: ${field}` });
        }
    }
    models_1.User.find({ email: req.body.email })
        .count()
        .exec()
        .then(count => {
        if (count > 0) {
            return res.status(422).json({ message: 'Email already registered' });
        }
        return models_1.User.hashPassword(req.body.password);
    })
        .then(hash => {
        return models_1.User.create({
            email: req.body.email,
            password: hash,
            created: Date.now(),
            name: {
                firstName: req.body.firstName,
                lastName: req.body.lastName
            }
        });
    })
        .then(user => res.status(201).json(user))
        .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    });
});
//POST to add a meal
exports.router.post('/users/me/add-meal', passport.authenticate('bearer', { session: false }), (req, res) => {
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
    models_1.User.findOneAndUpdate({ username: req.user.username }, { $push: { meals: { $each: [newMeal], $position: 0 } } }, { new: true })
        .exec()
        .then((user) => {
        res.status(201).json(user.apiRepr());
    });
});
//DELETE a specific meal by ID
exports.router.delete('/users/me/meals', passport.authenticate('bearer', { session: false }), (req, res) => {
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
