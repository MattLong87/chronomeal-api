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
                 User.create(generateFakeUser(email, hash))
                //.then(user => console.log(user));
            })
    }
}

function generateFakeUser(email, hash) {
    const numMeals = Math.floor(Math.random() * 6);
    const meals = [];
    for (let i = 1; i <= numMeals; i++) {
        meals.push(generateMeal);
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
        describe('POST /login endpoint', function(){
            it('should reject login when incorrect credentials supplied', function(){
                const invalidUser = {
                    email: 'doesnotexist',
                    password: 'doesnotexist'
                }
                return chai.request(app)
                    .post('/api/login')
                    .send(invalidUser)
                    .catch(function(res){
                        res.should.have.status(401);
                    })
            })
            it('should log the user in when supplied with correct credentials', function(){
                // console.log(JSON.stringify(fakeUsers[0]));
                // User.findOne({username: fakeUsers[0].username})
                // .then(user => console.log("user exists", user));
                return chai.request(app)
                    .post('/api/login')
                    .send(fakeUsers[0])
                    .then(function(res){
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        res.body.email.should.equal(fakeUsers[0].email);
                        res.body.token.should.be.a('string');
                    })
            })
        })
    })
})