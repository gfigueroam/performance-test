import chai from 'chai';
import request from 'request-promise';
import sinon from 'sinon';

import logger from '../../../../app/monitoring/logger';
import rest from '../../../../app/utils/rest';

import mute from '../../../common/helpers/mute';

const expect = chai.expect;

describe('rest', () => {
  const expectedToken = 'token_123';

  const expectedError = 'invalid_request';

  const swatchCtx = {
    auth: {
      token: expectedToken,
    },
    logger,
  };

  let requestStub;

  before(() => {
    // Stub out the request.get method before these tests
    requestStub = sinon.stub(request, 'get');
  });

  after(() => {
    // Drop all stub functionality as soon as tests are done
    request.get.restore();
  });

  describe('GET success', () => {
    // Mockery stub should take the param and resolve successfully as promise
    it('should return a promise after making a request', done => {
      requestStub.callsFake((uri, options) => (
        // Merge the URI and options into a single object successfully
        //  so that caller can assert the correct HTTP request options
        Promise.resolve({ options, uri })
      ));

      const expectedURI = 'https://www.google.com';
      rest.get.call(swatchCtx, expectedURI).then(result => {
        expect(result.uri).to.equal(expectedURI);
        expect(result.options.headers.Authorization).to.equal(expectedToken);

        done();
      }).catch(done);
    });

    it('should build a request with query params', done => {
      requestStub.callsFake((uri, options) => (
        // Merge the URI and options into a single object successfully
        //  so that caller can assert the correct HTTP request options
        Promise.resolve({ options, uri })
      ));

      const url = 'https://www.google.com';
      const params = { p1: '1234', p2: 5678 };

      const expectedURI = 'https://www.google.com?p1=1234&p2=5678';
      rest.get.call(swatchCtx, url, params).then(result => {
        expect(result.uri).to.equal(expectedURI);
        expect(result.options.headers.Authorization).to.equal(expectedToken);

        done();
      }).catch(done);
    });
  });

  describe('GET failure', () => {
    // Mockery stub should take the param and reject as promise
    it('should throw an error after a failure request', done => {
      requestStub.callsFake(() => (
        Promise.reject(expectedError)
      ));

      const expectedURI = 'https://www.google.com';
      mute.muteTestAsync(() => (
        rest.get.call(swatchCtx, expectedURI)
      )).catch(error => {
        expect(error).to.equal(expectedError);
        done();
      });
    });
  });
});
