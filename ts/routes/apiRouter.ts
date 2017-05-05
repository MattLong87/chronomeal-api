import * as express from 'express';
export const router = express.Router();

import {User} from '../models'

router.get('/', (req, res) => {
    res.send("foodtracker API");
})

//GET a user's information
router.get('/users/me', (req, res) =>{
    User.findOne()
    .exec()
    .then(user => {
        res.json(user)
    })
    .catch(
        err => {
            console.log(err);
            res.status(500).json({message: 'Internal Server Error'});
        }
    )
})

//POST to create a new user
router.post('/users', (req, res) => {
    User.create({
        username: req.body.username,
        name: {
            firstName: req.body.firstName,
            lastName: req.body.lastName
        }
    })
    .then(
        user => res.status(201).json(user)
    )
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    })
})

//POST to add a meal
router.post('/users/me/add-meal', (req, res) => {
    let newMeal: object = {
        time: req.body.time,
        food: req.body.food,
        notes: req.body.notes,
        pain: req.body.pain
    };

	User.findOneAndUpdate({username: req.body.username}, {$push: {meals: newMeal}}, {new:true})
	.exec()
	.then((user) => {
		res.status(201).json(user);
		})
})

//DELETE a specific meal by ID
router.delete('/users/me/meals', (req, res) => {
    User.update({username: req.body.username}, {$pull: {meals: {_id: req.body.mealId}}})
	.exec()
	.then(() => res.status(204).end())
})