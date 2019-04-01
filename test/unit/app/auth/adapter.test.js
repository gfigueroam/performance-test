import chai from 'chai';

import common from 'hmh-bfm-nodejs-common';

import auth from '../../../../app/auth';
import config from '../../../../app/config';
import constants from '../../../../app/utils/constants';
import errors from '../../../../app/models/errors';
import logger from '../../../../app/monitoring/logger';
import {
  noUniqueIdentifierKey,
  noUniqueIdentifierValue,
  emptyStringUniqueIdentifierValue,
} from '../../../common/helpers/tokens';

const expect = chai.expect;


describe('auth.adapter', () => {
  function createMockCtx(authorization, bvtHeader) {
    return {
      request: {
        headers: {
          authorization,
          [constants.UDS_BVT_REQUEST_HEADER]: bvtHeader,
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

    it('should throw if claim uniqueIdentifer value is empty', () => {
      const mockCtx = createMockCtx(noUniqueIdentifierValue);
      expect(() => auth.adapter.internal(mockCtx)).to.throw(errors.codes.ERROR_CODE_INVALID_AUTHZ);
    });

    it('should throw if claim uniqueIdentifer key is not present', () => {
      const mockCtx = createMockCtx(noUniqueIdentifierKey);
      expect(() => auth.adapter.internal(mockCtx)).to.throw(errors.codes.ERROR_CODE_INVALID_AUTHZ);
    });

    it('should throw if claim uniqueIdentifer value is an empty string', () => {
      const mockCtx = createMockCtx(emptyStringUniqueIdentifierValue);
      expect(() => auth.adapter.internal(mockCtx)).to.throw(errors.codes.ERROR_CODE_INVALID_AUTHZ);
    });

    it('should successfully validate a service token', () => {
      const testServiceToken = config.get('uds:service_token');
      const mockCtx = createMockCtx(testServiceToken);

      const result = auth.adapter.internal(mockCtx);
      expect(result.tokenType).to.equal('service');
      expect(result.token).to.equal(testServiceToken);
      expect(result.userId).to.equal(undefined);
      expect(result.useStubAuth).to.equal(false);
    });

    it('should successfully validate a service token with bvt header', () => {
      const testServiceToken = config.get('uds:service_token');
      const mockCtx = createMockCtx(testServiceToken, 'test');

      const result = auth.adapter.internal(mockCtx);
      expect(result.tokenType).to.equal('service');
      expect(result.token).to.equal(testServiceToken);
      expect(result.userId).to.equal(undefined);
      expect(result.useStubAuth).to.equal(true);
    });

    it('should successfully validate a user token', () => {
      const token = common.test.tokens.userTokens.internal;
      const mockCtx = createMockCtx(token);

      const result = auth.adapter.internal(mockCtx);
      expect(result.token).to.equal(token);
      expect(result.tokenType).to.equal('user');
      expect(result.userId).to.equal('e0f96e77-55b5-493f-b347-42f8c7907072');
    });

    it('should reject an expired user token', () => {
      const mockCtx = createMockCtx(common.test.tokens.expiredToken);

      expect(() => auth.adapter.internal(mockCtx)).to.throw(errors.codes.ERROR_CODE_AUTH_INVALID);
    });
  });

  describe('external', () => {
    it('should not reject a service token', () => {
      const token = config.get('uds:service_token');
      const mockCtx = createMockCtx(token);

      const result = auth.adapter.external(mockCtx);

      expect(result.tokenType).to.equal('service');
      expect(result.token).to.equal(token);
      expect(result.userId).to.equal(undefined);
    });

    it('should decode and initialize a valid user token', () => {
      const token = common.test.tokens.userTokens.external;
      const mockCtx = createMockCtx(token);

      const result = auth.adapter.external(mockCtx);
      expect(result.tokenType).to.equal('user');
      expect(result.token).to.equal(token);
      expect(result.userId).to.equal('cfc72467-0fe2-459f-89a2-29b8364957db');
    });

    it('should decode and initialize a valid user token with a hash attached', () => {
      const token = common.test.tokens.userTokens.externalHash;
      const mockCtx = createMockCtx(token);

      const result = auth.adapter.external(mockCtx);
      expect(result.tokenType).to.equal('user');
      expect(result.token).to.equal(token);
      expect(result.userId).to.equal('0143cc99-2a4c-4901-8405-1d4acfe4d4f2');
    });
  });
});
