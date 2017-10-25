import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../index';
import User from '../models/user.model';

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

const validUserCredentials = {
  username: 'react',
  password: 'express',
  email: 'react@softwareengineeringdaily.com',
  name: 'John Doe'
};

describe('## User APIs', () => {

  let user;
  let userToken;

  before((done) => {
    request(app)
    .post('/api/auth/register')
    .send(validUserCredentials)
    .expect(httpStatus.CREATED)
    .then((res) => {
      expect(res.body).to.have.property('token');
      userToken = res.body.token;
      // TODO: auth should return more info?
      user = Object.assign(res.body.user, validUserCredentials);
      // user = res.body.user
      done();
    })
    .catch(done);
  });

  describe('# GET /api/users/:userId', () => {
    it('should get user details', (done) => {
      request(app)
        .get(`/api/users/${user._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal(user.username);
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when user does not exists', (done) => {
      request(app)
        .get('/api/users/56c787ccc67fc16ccc1a5e92')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  // TODO: add a test to make sure we can't update
  // username to that of an existing user!

  // TODO: add test so we make sure we can only modify our
  // own data. Already tested with postman.

  describe('# PUT /api/users/:userId', () => {
    it('should update user details', (done) => {
      user.username = 'KK';
      request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal('KK');
          done();
        })
        .catch(done);
    });
  });

});
