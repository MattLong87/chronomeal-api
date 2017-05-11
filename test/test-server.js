const chai = require('chai');
const chaiHttp = require('chai-http');
const { TEST_DATABASE_URL } = require('../build/config');
const { app, closeServer, runServer } = require('../build/server');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const should = chai.should();
chai.use(chaiHttp);
const faker = require('faker');

const {User} = require('../build/models');

function seedUsers(){
    const fakeUsers = [];
    for (let i=1; i<=10; i++){
        fakeUsers.push(generateFakeUser());
    }
    return User.insertMany(fakeUsers);
}

function generateFakeUser(){
    const numMeals = Math.floor(Math.random() * 6);
    const meals = [];
    for (let i=1; i<=numMeals; i++){
        meals.push(generateMeal);
    }
    return {
        username: faker.internet.userName,
        password: faker.internet.password,
        name: {
            firstName: faker.name.firstName,
            lastName: faker.name.lastName
        },
        meals: meals
    }
}

function generateMeal(){
    return {
        time: faker.date.recent,
        food: faker.commerce.productName,
        notes: faker.lorem.sentence,
        pain: Math.floor(Math.random() * 11)
    }
}

function tearDownDb(){
    return mongoose.connection.dropDatabase();
}

describe('Foodtracker API', function () {
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });
    beforeEach(function(){
        return seedUsers();
    })
    afterEach(function(){
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
                    console.log(User.findOne())
                    res.should.have.status(200);
                })
        })
    })
})