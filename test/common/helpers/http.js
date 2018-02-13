import chai from 'chai';
import util from 'util';

import config from '../../../app/config';
import constants from '../../../app/utils/constants';
import logger from '../../../app/monitoring/logger';

import paths from './paths';
import tokens from './tokens';

const expect = chai.expect;

const endpoint = config.get('uds:url:internal');

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

function expectResponse(result, done) {
  return (error, res) => {
    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal(result);
    done(error);
  };
}

// Helper to make a GET request and execute a callback function
//  Requests does not include a token for publicly available endpoints
function sendGetRequest(path, onComplete) {
  chai.request(endpoint)
    .get(path)
    .set(constants.UDS_BVT_REQUEST_HEADER, true)
    .set(constants.UDS_CONSISTENT_READ_HEADER, true)
    .end(onComplete);
}

// Helper to make a POST request and execute a callback function
function sendPostRequest(path, token, params, onComplete) {
  chai.request(endpoint)
    .post(path)
    .set('Content-Type', 'application/json')
    .set('Authorization', token)
    .set(constants.UDS_BVT_REQUEST_HEADER, true)
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
  const onComplete = expectResponse(result, done);
  sendPostRequest(path, token, params, onComplete);
}

// Helper to make a POST request and expect an error response
function sendPostRequestError(path, token, params, errorCode, done) {
  const result = {
    error: errorCode,
    ok: false,
  };
  const onComplete = expectResponse(result, done);
  sendPostRequest(path, token, params, onComplete);
}

// Helper to make a POST request and expect an error response with details message
function sendPostRequestErrorDetails(path, token, params, errorCode, details, done) {
  const result = {
    details,
    error: errorCode,
    ok: false,
  };
  const onComplete = expectResponse(result, done);
  sendPostRequest(path, token, params, onComplete);
}

// Helper to send batch request with an array of params
function sendBatchRequest(token, params, results, done) {
  const path = paths.BATCH_ENDPOINT;
  const onComplete = expectResponse(results, done);
  sendPostRequest(path, token, params, onComplete);
}

function sendBatchRequestError(token, params, errorCode, done) {
  const path = paths.BATCH_ENDPOINT;
  const result = {
    error: errorCode,
    ok: false,
  };
  const onComplete = expectResponse(result, done);
  sendPostRequest(path, token, params, onComplete);
}

// Helper to send batch request with an array of params
function sendBatchRequestErrorDetails(token, params, errorCode, details, done) {
  const path = paths.BATCH_ENDPOINT;
  const result = {
    details,
    error: errorCode,
    ok: false,
  };
  const onComplete = expectResponse(result, done);
  sendPostRequest(path, token, params, onComplete);
}

export default {
  sendBatchRequest,
  sendBatchRequestError,
  sendBatchRequestErrorDetails,
  sendGetRequest,
  sendPostRequest,
  sendPostRequestError,
  sendPostRequestErrorDetails,
  sendPostRequestSuccess,
  sendSeedRequest,
};
