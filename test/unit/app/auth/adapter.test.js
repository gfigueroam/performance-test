import chai from 'chai';

import auth from '../../../../app/auth';
import config from '../../../../app/config';
import errors from '../../../../app/models/errors';
import logger from '../../../../app/monitoring/logger';

import tokens from '../../../common/helpers/tokens';

const expect = chai.expect;

describe('authAdapter', () => {
  function createMockCtx(authorization) {
    return {
      request: {
        headers: {
          authorization,
        },
      },
      swatchCtx: {
        logger,
      },
    };
  }

  describe('internal', () => {
    it('should throw if no authorization header is present', () => {
      const mockCtx = {
        request: {
          headers: {},
        },
      };
      expect(() => auth.adapter.internal(mockCtx)).to.throw(errors.codes.ERROR_CODE_AUTH_NO_TOKEN);
    });

    it('should throw if authorization header is in an invalid format', () => {
      const mockCtx = createMockCtx('INVALID_TOKEN');
      expect(() => auth.adapter.internal(mockCtx)).to.throw(errors.codes.ERROR_CODE_AUTH_INVALID);
    });

    it('should throw if authorization header is not actually a token', () => {
      const mockCtx = createMockCtx('INVALID_TOKEN INVALID_BODY');
      expect(() => auth.adapter.internal(mockCtx)).to.throw(errors.codes.ERROR_CODE_AUTH_INVALID);
    });

    it('should throw if authorization header looks correct but is not correctly encoded', () => {
      const mockCtx = createMockCtx('SIF_HMACSHA256 INVALID_BODY');
      expect(() => auth.adapter.internal(mockCtx)).to.throw(errors.codes.ERROR_CODE_AUTH_INVALID);
    });

    it('should throw if authorization header does not match any service tokens', () => {
      // Randomly generated one-time token that does not come from known HMH clients
      const unknownTokenBody = 'SE1IX0RNUFM6azBicXRBbmF1NVpsK1VMeGJtd1dnRGluN1FMZ2V5SXAxUS9FajBqVFBQYz0K';
      const mockCtx = createMockCtx(`SIF_HMACSHA256 ${unknownTokenBody}`);
      expect(() => auth.adapter.internal(mockCtx)).to.throw(errors.codes.ERROR_CODE_AUTH_INVALID);
    });

    it('should successfully validate a service token', () => {
      const testServiceToken = config.get('uds:test_service_token');
      const mockCtx = createMockCtx(testServiceToken);

      const result = auth.adapter.internal(mockCtx);
      expect(result.tokenType).to.equal('service');
      expect(result.token).to.equal(testServiceToken);
    });

    it('should successfully validate a user token', () => {
      const token = tokens.userTokens.internal;
      const mockCtx = createMockCtx(token);

      const result = auth.adapter.internal(mockCtx);
      expect(result.token).to.equal(token);
      expect(result.tokenType).to.equal('user');
    });

    it('should reject an expired user token', () => {
      const mockCtx = createMockCtx(tokens.expiredToken);

      expect(() => auth.adapter.internal(mockCtx)).to.throw(errors.codes.ERROR_CODE_AUTH_INVALID);
    });
  });

  describe('external', () => {
    it('should reject a token that fails to decode', () => {
      const token = config.get('uds:test_service_token');
      const mockCtx = createMockCtx(token);

      expect(() => auth.adapter.external(mockCtx)).to.throw(errors.codes.ERROR_CODE_AUTH_INVALID);
    });

    it('should decode and initialize a valid user token', () => {
      const token = tokens.userTokens.external;
      const mockCtx = createMockCtx(token);

      const result = auth.adapter.external(mockCtx);
      expect(result.tokenType).to.equal('user');
      expect(result.token).to.equal(token);
    });

    it('should decode and initialize a valid user token with a hash attached', () => {
      const token = tokens.userTokens.externalHash;
      const mockCtx = createMockCtx(token);

      const result = auth.adapter.external(mockCtx);
      expect(result.tokenType).to.equal('user');
      expect(result.token).to.equal(token);
    });
  });
});
