"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
exports.router = express.Router();
const models_1 = require("../models");
const passport = require("passport");
// const LocalStrategy = require('passport-local').Strategy;
// passport.use(new LocalStrategy((username: string, password: string, done) => {
//     User.findOne({username: username}, (err, user) => {
//         if (err) {return done(err);}
//         if (!user) {
//             return done(null, false, {message: 'Incorrect username'});
//         }
//         if (!user.validPassword(password)) {
//             return done(null, false, {message: 'Incorrect password'});
//         }
//         return done(null, user);
//     })
// }));
//MIDDLEWARE
// router.use(session({secret: 'mydogsnameisarden'}));
// router.use(passport.initialize());
// router.use(passport.session());
exports.router.get('/', (req, res) => {
    res.send("foodtracker API");
});
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
    models_1.User.findOneAndUpdate({ username: req.user.username }, { $push: { meals: newMeal } }, { new: true })
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
