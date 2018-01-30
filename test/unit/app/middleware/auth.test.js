import chai from 'chai';

import auth from '../../../../app/auth';
import errors from '../../../../app/models/errors';
import logger from '../../../../app/monitoring/logger';
import middleware from '../../../../app/middleware';

import runner from '../../../common/helpers/runner';

const expect = chai.expect;

const requestor = 'some.test.user.guid.1';


// Test function that does nothing for cases that throw
const noop = () => {};

const mockRequest = {
  url: 'https://hmh.dmps.test.com',
};

const mockEmptyCtx = {
  auth: {},
};

const mockInvalidCtx = {
  auth: {
    tokenType: 'invalid',
  },
  logger,
};

// User token context doesnt need a user param
const mockUserTokenCtx = {
  auth: {
    token: 'test_user_token',
    tokenType: auth.tokens.USER_TOKEN,
    useStubAuth: false,
  },
  logger,
  params: {},
};

// Service token context with a valid user param
const mockServiceTokenCtx = {
  auth: {
    tokenType: auth.tokens.SERVICE_TOKEN,
    useStubAuth: false,
  },
  logger,
  params: { requestor },
};

// Service token context with no user param
const mockInvalidServiceTokenCtx = {
  auth: {
    tokenType: auth.tokens.SERVICE_TOKEN,
    useStubAuth: false,
  },
  logger,
  params: {},
};

describe('Auth Middleware', () => {
  describe('requireUserTokenOrRequestorParameter', () => {
    it('should throw an error without auth ctx', done => {
      middleware.auth.requireUserTokenOrRequestorParameter(undefined, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with an empty swatch ctx', done => {
      middleware.auth.requireUserTokenOrRequestorParameter({}, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with swatch ctx but no auth ctx', done => {
      middleware.auth.requireUserTokenOrRequestorParameter({ swatchCtx: {} }, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with no token type', done => {
      middleware.auth.requireUserTokenOrRequestorParameter({
        swatchCtx: mockEmptyCtx,
      }, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with an invalid token type', done => {
      middleware.auth.requireUserTokenOrRequestorParameter({
        swatchCtx: mockInvalidCtx,
      }, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should call next function in chain after verifying user token', () => {
      runner.syncRunMiddleware(middleware.auth.requireUserTokenOrRequestorParameter, {
        request: mockRequest,
        swatchCtx: mockUserTokenCtx,
      });
    });

    it('should throw an error with a server token but no user param', done => {
      middleware.auth.requireUserTokenOrRequestorParameter({
        swatchCtx: mockInvalidServiceTokenCtx,
      }, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_USER_NOT_FOUND);
        done();
      });
    });

    it('should call next function in chain after verifying service token with user', () => {
      runner.syncRunMiddleware(middleware.auth.requireUserTokenOrRequestorParameter, {
        request: mockRequest,
        swatchCtx: mockServiceTokenCtx,
      });
    });
  });

  describe('requireServiceToken', () => {
    it('should throw an error without auth ctx', done => {
      middleware.auth.requireServiceToken(undefined, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with an empty ctx', done => {
      middleware.auth.requireServiceToken({}, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with swatch ctx but no auth ctx', done => {
      middleware.auth.requireServiceToken({ swatchCtx: {} }, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with no token type', done => {
      middleware.auth.requireServiceToken({
        swatchCtx: mockEmptyCtx,
      }, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE);
        done();
      });
    });

    it('should throw an error with an invalid token type', done => {
      middleware.auth.requireServiceToken({
        swatchCtx: mockInvalidCtx,
      }, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE);
        done();
      });
    });

    it('should throw an error with user token type', done => {
      middleware.auth.requireServiceToken({
        swatchCtx: mockUserTokenCtx,
      }, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE);
        done();
      });
    });

    it('should call next function in chain after verifying service token', () => {
      runner.syncRunMiddleware(middleware.auth.requireServiceToken, {
        request: mockRequest,
        swatchCtx: mockServiceTokenCtx,
      });
    });
  });
});
