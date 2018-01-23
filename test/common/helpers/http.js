import chai from 'chai';
import util from 'util';

import logger from '../../../app/monitoring/logger';
import constants from '../../../app/utils/constants';
import tokens from './tokens';

const expect = chai.expect;

function verifyResponseOk(done) {
  return (error, res) => {
    if (error) {
      logger.warn(`BVT seed error: ${util.inspect(error)}`);
      done(error);
    } else if (res.body && res.body.ok) {
      done();
    } else {
      logger.warn(`BVT seed request failed: ${util.inspect(res.body)}`);
      done(new Error('bvt_seed_error'));
    }
  };
}

function expectResponseSuccess(result, done) {
  return (error, res) => {
    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal(result);
    done(error);
  };
}

function expectResponseError(result, done) {
  return (error, res) => {
    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal(result);
    done(error);
  };
}

// Helper to make a GET request and execute a callback function
//  Requests does not include a token for publicly available endpoints
function sendGetRequest(path, onComplete) {
  chai.request(process.env.ENDPOINT)
    .get(path)
    .set(constants.UDS_CONSISTENT_READ_HEADER, true)
    .end(onComplete);
}

// Helper to make a POST request and execute a callback function
function sendPostRequest(path, token, params, onComplete) {
  chai.request(process.env.ENDPOINT)
    .post(path)
    .set('Content-Type', 'application/json')
    .set('Authorization', token)
    .set(constants.UDS_CONSISTENT_READ_HEADER, true)
    .send(params)
    .end(onComplete);
}

// Helper to make a seed call that expects success response and
//  will abort on failure, but does not make any test assertions
function sendSeedRequest(path, params, done) {
  const token = tokens.serviceToken;
  const onComplete = verifyResponseOk(done);
  sendPostRequest(path, token, params, onComplete);
}

// Helper to make a POST request and expect a success response
function sendPostRequestSuccess(path, token, params, result, done) {
  const onComplete = expectResponseSuccess(result, done);
  sendPostRequest(path, token, params, onComplete);
}

// Helper to make a POST request and expect an error response
function sendPostRequestError(path, token, params, errorCode, done) {
  const result = {
    error: errorCode,
    ok: false,
  };
  const onComplete = expectResponseError(result, done);
  sendPostRequest(path, token, params, onComplete);
}

// Helper to make a POST request and expect an error response with details message
function sendPostRequestErrorDetails(path, token, params, errorCode, details, done) {
  const result = {
    details,
    error: errorCode,
    ok: false,
  };
  const onComplete = expectResponseError(result, done);
  sendPostRequest(path, token, params, onComplete);
}

export default {
  sendGetRequest,
  sendPostRequest,
  sendPostRequestError,
  sendPostRequestErrorDetails,
  sendPostRequestSuccess,
  sendSeedRequest,
};
