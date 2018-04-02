import chai from 'chai';
import sinon from 'sinon';

import common from 'hmh-bfm-nodejs-common';

import logger from '../../../../app/monitoring/logger';
import rest from '../../../../app/utils/rest';

const expect = chai.expect;


describe('rest', () => {
  const expectedToken = 'token_123';

  const swatchCtx = {
    auth: {
      token: expectedToken,
    },
    logger,
  };

  before(() => {
    // Stub out the common rest.get method before these tests
    sinon.stub(common.utils.rest, 'get').callsFake((uri, options) => (
      // Merge the URI and options into a single object successfully
      //  so that caller can assert the correct HTTP request options
      Promise.resolve({ options, uri })
    ));
  });

  after(() => {
    // Drop all stub functionality as soon as tests are done
    common.utils.rest.get.restore();
  });

  describe('GET success', () => {
    // Mockery stub should take the param and resolve successfully as promise
    it('should return a promise after making a request', done => {
      const expectedURI = 'https://www.google.com';
      rest.get.call(swatchCtx, expectedURI).then(result => {
        expect(result.uri).to.equal(expectedURI);
        expect(result.options.headers.Authorization).to.equal(expectedToken);

        done();
      }).catch(done);
    });

    it('should build a request with query params', done => {
      const url = 'https://www.google.com';
      const params = { p1: '1234', p2: 5678 };

      const transform = 'should_be_function';
      const expectedURI = 'https://www.google.com?p1=1234&p2=5678';

      rest.get.call(swatchCtx, url, params, transform).then(result => {
        expect(result.uri).to.equal(expectedURI);

        expect(result.options.json).to.equal(true);
        expect(result.options.transform).to.equal(transform);
        expect(result.options.followRedirect).to.equal(false);
        expect(result.options.headers.Authorization).to.equal(expectedToken);

        done();
      }).catch(done);
    });
  });
});
