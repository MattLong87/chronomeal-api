"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
exports.router = express.Router();
const models_1 = require("../models");
exports.router.get('/', (req, res) => {
    res.send("foodtracker API");
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
    models_1.User.findByIdAndUpdate(req.body.username, { $pull: { meals: { _id: req.body.mealId } } })
        .exec()
        .then(() => res.status(204).end());
});
