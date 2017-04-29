const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, closeServer, runServer } = require('../build/server');

const should = chai.should();
chai.use(chaiHttp);

describe('GET endpoint', function () {
    before(function () {
        return runServer();
    });
    after(function () {
        return closeServer();
    });

    it('should return user\'s information on GET', function () {
        return chai.request(app)
            .get('/')
            .then(function (res) {
                res.should.have.status(200);
            })
    })
})