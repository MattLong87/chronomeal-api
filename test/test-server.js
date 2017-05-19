const chai = require('chai');
const chaiHttp = require('chai-http');
const { TEST_DATABASE_URL } = require('../build/config');
const { app, closeServer, runServer } = require('../build/server');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-shallow-deep-equal'))
const faker = require('faker');

const { User } = require('../build/models');

//global array to store generated usernames and passwords
let fakeUsers;

function seedUsers() {
    fakeUsers = [];
    for (let i = 1; i <= 1; i++) {
        const email = faker.internet.email();
        const password = faker.internet.password();
        fakeUsers.push({ email, password })
        return User.hashPassword(password)
            .then(function (hash) {
                return User.create(generateFakeUser(email, hash))
                    .catch((err) => console.log(err))
                //.then(user => console.log(user));
            })
    }
}

function generateFakeUser(email, hash) {
    const numMeals = Math.floor(Math.random() * 6);
    const meals = [];
    for (let i = 1; i <= numMeals; i++) {
        meals.push(generateMeal());
    }
    return {
        password: hash,
        name: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        },
        meals: meals,
        created: 1111111,
        email: email
    }
}

function generateMeal() {
    return {
        time: faker.date.recent(),
        food: faker.commerce.productName(),
        notes: faker.lorem.sentence(),
        pain: Math.floor(Math.random() * 11)
    }
}

function tearDownDb() {
    return mongoose.connection.dropDatabase();
}

describe('Foodtracker API', function () {
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
    describe('Routes when user is not logged in', function () {
        describe('GET user information endpoint', function () {
            it('should not return information', function () {
                return chai.request(app)
                    .get('/api/users/me')
                    .catch(function (res) {
                        res.should.have.status(401);
                    })
            })
        })
        describe('POST /login endpoint', function () {
            it('should reject login when incorrect credentials supplied', function () {
                const invalidUser = {
                    email: 'doesnotexist',
                    password: 'doesnotexist'
                }
                return chai.request(app)
                    .post('/api/login')
                    .send(invalidUser)
                    .catch(function (res) {
                        res.should.have.status(401);
                    })
            })
            it('should log the user in when supplied with correct credentials', function () {
                return chai.request(app)
                    .post('/api/login')
                    .send(fakeUsers[0])
                    .then(function (res) {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        res.body.email.should.equal(fakeUsers[0].email);
                        res.body.token.should.be.a('string');
                    })
            })
        })
    })
    describe('routes following login', function () {
        describe('GET /users/me endpoint', function () {
            it('Should return the correct user\'s information', function () {
                let res;
                return chai.request(app)
                    .post('/api/login')
                    .send(fakeUsers[0])
                    .then(function (res) {
                        const token = res.body.token;
                        return chai.request(app)
                            .get('/api/users/me')
                            .set('Authorization', `Bearer ${token}`)
                            .then(function (_res) {
                                res = _res;
                                res.should.have.status(200);
                                res.should.be.json;
                                res.body.email.should.equal(fakeUsers[0].email);
                            })
                    })
            })
        })
        describe('POST /users/me/add-meal endpoint', function () {
            it('should add a meal to the user', function () {
                let fakeMeal = {
                    time: 'fakeTime',
                    food: 'fakeFood',
                    notes: 'fakeNotes',
                    pain: 1
                }
                let res;
                return chai.request(app)
                    .post('/api/login')
                    .send(fakeUsers[0])
                    .then(function (loggedInRes) {
                        const token = loggedInRes.body.token;
                        return chai.request(app)
                            .post(`/api/users/me/add-meal?access_token=${token}`)
                            .send(fakeMeal)
                            .then(function (_res) {
                                res = _res;
                                res.should.have.status(201);
                                res.body.meals[0].should.shallowDeepEqual(fakeMeal);
                            })
                    })
            })
        })
        describe('DELETE /users/me/meals endpoint', function () {
            it('should delete a meal when provided with an id', function (done) {
                User.findOne({ email: fakeUsers[0].email })
                    .exec()
                    .then(function (user) {
                        const id = user.meals[0]['_id'];
                        return chai.request(app)
                            .post('/api/login')
                            .send(fakeUsers[0])
                            .then(function (loggedInRes) {
                                const token = loggedInRes.body.token;
                                return chai.request(app)
                                    .delete(`/api/users/me/meals?access_token=${token}`)
                                    .send({ mealId: id })
                                    .then(function (res) {
                                        res.should.have.status(204);
                                        done();
                                    })
                            })
                    })
            })
        })
    })
})