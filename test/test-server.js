const chai = require('chai');
const chaiHttp = require('chai-http');
const { TEST_DATABASE_URL } = require('../build/config');
const { app, closeServer, runServer } = require('../build/server');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const should = chai.should();
chai.use(chaiHttp);
const faker = require('faker');

const { User } = require('../build/models');

function seedUsers() {
    const fakeUsers = [];
    for (let i = 1; i <= 10; i++) {
        const username = faker.internet.userName;
        const password = faker.internet.password;
        fakeUsers.push({username, password})
        User.hashPassword(password)
        .then(function(hash){
            User.create(generateFakeUser(username, hash));
        })
    }
}

function generateFakeUser(username, hash) {
    const numMeals = Math.floor(Math.random() * 6);
    const meals = [];
    for (let i = 1; i <= numMeals; i++) {
        meals.push(generateMeal);
    }
        return {
            username: username,
            password: hash,
            name: {
                firstName: faker.name.firstName,
                lastName: faker.name.lastName
            },
            meals: meals
        }
    }

function generateMeal() {
    return {
        time: faker.date.recent,
        food: faker.commerce.productName,
        notes: faker.lorem.sentence,
        pain: Math.floor(Math.random() * 11)
    }
}

function tearDownDb() {
    return mongoose.connection.dropDatabase();
}

describe('Foodtracker API', function () {
    describe('Routes when user is not logged in', function () {
        before(function () {
            return runServer(TEST_DATABASE_URL);
        });
        beforeEach(function () {
            return seedUsers();
        })
        afterEach(function () {
            return tearDownDb();
        })
        after(function () {
            return closeServer();
        });

        describe('GET endpoint', function () {
            it('should return user\'s information on GET', function () {
                return chai.request(app)
                    .get('/api')
                    .then(function (res) {
                        res.should.have.status(200);
                    })
            })
        })
    })
})