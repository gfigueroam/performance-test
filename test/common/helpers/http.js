import chai from 'chai';
import chaiHttp from 'chai-http';

import util from 'util';

import common from 'hmh-bfm-nodejs-common';

import paths from './paths';

import nconf from '../../../app/config';
import constants from '../../../app/utils/constants';
import logger from '../../../app/monitoring/logger';

chai.should();
chai.use(chaiHttp);

const { expect } = chai;

const BVT_REQUEST_HEADER = constants.UDS_BVT_REQUEST_HEADER;
const CONSISTENT_READ_HEADER = constants.UDS_CONSISTENT_READ_HEADER;
const endpoint = nconf.get('uds:url:internal');

const headers = {
  BVT_REQUEST_HEADER,
  CONSISTENT_READ_HEADER,
};

const tokens = common.test.tokens;

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

function verifyResponse(error, res, result, done) {
  expect(res).to.have.status(200);
  expect(res.body).to.deep.equal(result);
  done(error);
}

function expectResponse(result, done) {
  return (error, res) => {
    verifyResponse(error, res, result, done);
  };
}

function expectCountResponse(result, count, done) {
  const header = headers.QUERY_COUNT_HEADER;

  return (error, res) => {
    const dbCount = Number(res.headers[header]);
    expect(dbCount).to.equal(count);
    verifyResponse(error, res, result, done);
  };
}

// Helper to make a GET request and execute a callback function
//  Requests does not include a token for publicly available endpoints
function sendGetRequest(path, done) {
  chai.request(endpoint)
    .get(path)
    .end((error, res) => {
      expect(res).to.have.status(200);
      done(error, res);
    });
}

// Helper to make a POST request and execute a callback function
function sendPostRequest(path, token, params, onComplete) {
  // Set a special header to indicate BVT tests that should bypass
  //  authentication and require read-from-master for DB queries
  chai.request(endpoint)
    .post(path)
    .set('Content-Type', 'application/json')
    .set('Authorization', token)
    .set(headers.BVT_REQUEST_HEADER, true)
    .set(headers.CONSISTENT_READ_HEADER, true)
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

// Helper to make a POST request and expect a success response
function sendPostRequestSuccessCount(path, token, params, result, count, done) {
  const onComplete = expectCountResponse(result, count, done);
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

function loginFlow(username, password, tenantPid, done) {
  chai.request(endpoint.ids_endpoint)
    .post('/ids/v1/sus/login')
    .send({
      password,
      tenantPid,
      username,
    })
    .end((error, res) => {
      expect(error).to.equal(null);
      expect(res.body.sifToken).not.to.equal(undefined);

      done(res.body.sifToken);
    });
}

const http = {
  loginFlow,
  sendBatchRequest,
  sendBatchRequestError,
  sendBatchRequestErrorDetails,
  sendGetRequest,
  sendPostRequest,
  sendPostRequestError,
  sendPostRequestErrorDetails,
  sendPostRequestSuccess,
  sendPostRequestSuccessCount,
  sendSeedRequest,
};

export default http;
