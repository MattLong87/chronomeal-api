import * as express from 'express';
export const router = express.Router();
import * as session from 'express-session';
import * as bcrypt from 'bcrypt';

import { User } from '../models'

import * as passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

passport.use(new LocalStrategy((username: string, password: string, done) => {
    let user;
    User.findOne({ username: username })
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
        })
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    })
})

//MIDDLEWARE
router.use(session({ 
    secret: 'mydogsnameisarden',
    resave: false,
    saveUninitialized: false
 }));
router.use(passport.initialize());
router.use(passport.session());

router.get('/', (req, res) => {
    res.send("foodtracker API");
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({ message: "login successful" });
});

//GET a user's information
router.get('/users/me', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    //user is attached to request object by passport.deserializeUser
    res.send(req.user);
})

//POST to create a new user
router.post('/users', (req, res) => {
    //verify required fields are present
    const requiredFields = ["username", "password", "firstName", "lastName"];
    for (let i=0; i<requiredFields.length; i++){
        const field = requiredFields[i];
         if(!req.body[field]){
             return res.json({message: `Missing field: ${field}`});
         }
    }
    User.find({ username: req.body.username })
        .count()
        .exec()
        .then(count => {
            if (count > 0) {
                return res.status(422).json({ message: 'Username already taken' });
            }
            return User.hashPassword(req.body.password)
        })
        .then(hash => {
            return User.create({
                username: req.body.username,
                password: hash,
                name: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName
                }
            })
        })
        .then(
        user => res.status(201).json({ user })
        )
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        })
})

//POST to add a meal
router.post('/users/me/add-meal', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    //verify required fields are present
    const requiredFields = ["time", "food", "notes", "pain"];
    for (let i=0; i<requiredFields.length; i++){
        const field = requiredFields[i];
         if(!req.body[field]){
             return res.json({message: `Missing field: ${field}`});
         }
    }
    let newMeal: object = {
        time: req.body.time,
        food: req.body.food,
        notes: req.body.notes,
        pain: req.body.pain
    };
    User.findOneAndUpdate({ username: req.user.username }, { $push: { meals: newMeal } }, { new: true })
        .exec()
        .then((user) => {
            res.status(201).json(user);
        })
})

//DELETE a specific meal by ID
router.delete('/users/me/meals', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    //verify required fields are present
    const requiredFields = ["mealId"];
    for (let i=0; i<requiredFields.length; i++){
        const field = requiredFields[i];
         if(!req.body[field]){
             return res.json({message: `Missing field: ${field}`});
         }
    }
    User.update({ username: req.user.username }, { $pull: { meals: { _id: req.body.mealId } } })
        .exec()
        .then(() => res.status(204).end())
})