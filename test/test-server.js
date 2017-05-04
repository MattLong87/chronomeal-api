const chai = require('chai');
const chaiHttp = require('chai-http');
const { TEST_DATABASE_URL } = require('../build/config');
const { app, closeServer, runServer } = require('../build/server');
const mongoose = require('mongoose');
mongoose.promise = global.promise;
const should = chai.should();
chai.use(chaiHttp);

describe('Foodtracker API', function () {
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });
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