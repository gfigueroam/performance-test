import chai from 'chai';
import sinon from 'sinon';

import common from 'hmh-bfm-nodejs-common';

import errors from '../../../../app/models/errors';
import logger from '../../../../app/monitoring/logger';
import middleware from '../../../../app/middleware';

const expect = chai.expect;


describe('middleware.auth', () => {
  const requestor = 'some.test.user.guid.1';

  // Stub function to test when it is called
  const noop = sinon.stub();

  const mockRequest = {
    url: 'https://hmh.uds.test.com',
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
      tokenType: common.auth.tokens.USER_TOKEN,
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
      tokenType: common.auth.tokens.USER_TOKEN,
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
      tokenType: common.auth.tokens.SERVICE_TOKEN,
      useStubAuth: false,
    },
    logger,
    params: { requestor },
    req: mockRequest,
  };

  // Service token context with no requestor param
  const mockInvalidServiceTokenCtx = {
    auth: {
      tokenType: common.auth.tokens.SERVICE_TOKEN,
      useStubAuth: false,
    },
    logger,
    params: {},
  };

  afterEach(() => { noop.reset(); });


  describe('requireUserTokenOrRequestorParameter', () => {
    const authFn = middleware.auth.requireUserTokenOrRequestorParameter;

    it('should throw an error without auth ctx', async () => {
      try {
        await authFn(undefined, noop);
      } catch (error) {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
      }
      expect(noop.called).to.equal(false);
    });

    it('should throw an error with an empty swatch ctx', async () => {
      try {
        await authFn({}, noop);
      } catch (error) {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
      }
      expect(noop.called).to.equal(false);
    });

    it('should throw an error with no token type', async () => {
      try {
        await authFn(mockEmptyCtx, noop);
      } catch (error) {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
      }
      expect(noop.called).to.equal(false);
    });

    it('should throw an error with an invalid token type', async () => {
      try {
        await authFn(mockInvalidCtx, noop);
      } catch (error) {
        expect(error).to.equal(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
      }
      expect(noop.called).to.equal(false);
    });

    it('should throw an error when requestor doesnt match user from token', async () => {
      try {
        await authFn(mockWrongUserTokenCtx, noop);
      } catch (error) {
        expect(error).to.equal(errors.codes.ERROR_CODE_INVALID_USER);
      }
      expect(noop.called).to.equal(false);
    });

    it('should call next function in chain after verifying user token', async () => {
      await authFn(mockUserTokenCtx, noop);

      expect(mockUserTokenCtx.params.requestor).to.equal(mockUserTokenCtx.auth.userId);
      expect(noop.called).to.equal(true);
    });

    it('should throw an error with a server token but no user param', async () => {
      try {
        await authFn(mockInvalidServiceTokenCtx, noop);
      } catch (error) {
        expect(error).to.equal(errors.codes.ERROR_CODE_USER_NOT_FOUND);
      }
      expect(noop.called).to.equal(false);
    });

    it('should call next function in chain after verifying service token with user', async () => {
      await authFn(mockServiceTokenCtx, noop);
      expect(noop.called).to.equal(true);
    });
  });
});
