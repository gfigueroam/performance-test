import chai from 'chai';

import auth from '../../../../app/auth';
import errors from '../../../../app/models/errors';
import logger from '../../../../app/monitoring/logger';
import middleware from '../../../../app/middleware';

import runner from '../../../common/helpers/runner';

const expect = chai.expect;


describe('Auth Middleware', () => {
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

  // User token context with no requestor param
  const mockUserTokenCtx = {
    auth: {
      token: 'test_user_token',
      tokenType: auth.tokens.USER_TOKEN,
      useStubAuth: false,
    },
    logger,
    params: {},
    req: mockRequest,
  };

  // User token context with non-matching requestor param
  const mockWrongUserTokenCtx = {
    auth: {
      token: 'test_user_token',
      tokenType: auth.tokens.USER_TOKEN,
      userId: 'wrong_test_user_id',
      useStubAuth: false,
    },
    logger,
    params: { requestor },
    req: mockRequest,
  };

  // Service token context with a valid requestor param
  const mockServiceTokenCtx = {
    auth: {
      tokenType: auth.tokens.SERVICE_TOKEN,
      useStubAuth: false,
    },
    logger,
    params: { requestor },
    req: mockRequest,
  };

  // Service token context with no requestor param
  const mockInvalidServiceTokenCtx = {
    auth: {
      tokenType: auth.tokens.SERVICE_TOKEN,
      useStubAuth: false,
    },
    logger,
    params: {},
  };


  describe('requireUserTokenOrRequestorParameter', () => {
    const authFn = middleware.auth.requireUserTokenOrRequestorParameter;

    it('should throw an error without auth ctx', done => {
      authFn(undefined, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with an empty swatch ctx', done => {
      authFn({}, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with no token type', done => {
      authFn(mockEmptyCtx, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with an invalid token type', done => {
      authFn(mockInvalidCtx, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error when requestor doesnt match user from token', done => {
      authFn(mockWrongUserTokenCtx, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_INVALID_USER);
        done();
      });
    });

    it('should call next function in chain after verifying user token', () => {
      runner.asyncRunMiddleware(authFn, mockUserTokenCtx, () => {
        expect(mockUserTokenCtx.params.requestor).to.equal(mockUserTokenCtx.auth.userId);
      });
    });

    it('should throw an error with a server token but no user param', done => {
      authFn(mockInvalidServiceTokenCtx, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_USER_NOT_FOUND);
        done();
      });
    });

    it('should call next function in chain after verifying service token with user', () => {
      runner.syncRunMiddleware(authFn, mockServiceTokenCtx);
    });
  });

  describe('requireServiceToken', () => {
    const authFn = middleware.auth.requireServiceToken;

    it('should throw an error without auth ctx', done => {
      authFn(undefined, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with an empty ctx', done => {
      authFn({}, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with no token type', done => {
      authFn(mockEmptyCtx, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE);
        done();
      });
    });

    it('should throw an error with an invalid token type', done => {
      authFn(mockInvalidCtx, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE);
        done();
      });
    });

    it('should throw an error with user token type', done => {
      authFn(mockUserTokenCtx, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_WRONG_TOKEN_TYPE);
        done();
      });
    });

    it('should call next function in chain after verifying service token', () => {
      runner.syncRunMiddleware(authFn, mockServiceTokenCtx);
    });
  });

  describe('requireUserOrServiceToken', () => {
    const authFn = middleware.auth.requireUserOrServiceToken;

    it('should throw an error without auth ctx', done => {
      authFn(undefined, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with an empty swatch ctx', done => {
      authFn({}, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with no token type', done => {
      authFn(mockEmptyCtx, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should throw an error with an invalid token type', done => {
      authFn(mockInvalidCtx, noop).catch(error => {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
        done();
      });
    });

    it('should call next function in chain after verifying user token', () => {
      runner.syncRunMiddleware(authFn, mockUserTokenCtx);
    });

    it('should call next function in chain after verifying service token', () => {
      runner.syncRunMiddleware(authFn, mockServiceTokenCtx);
    });
  });
});
