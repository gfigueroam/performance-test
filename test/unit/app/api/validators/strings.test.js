import chai from 'chai';

import errors from '../../../../../app/models/errors';
import stringValidators from '../../../../../app/api/validators/strings';

const expect = chai.expect;

describe('String Validators', () => {
  const invalidLongName = new Array(300).join('a');

  const validNames = [
    'name',
    'test.name.123',
    '1.Test_Name_2',
    'hmh.eng.co.uds.111',
    'HMH.CO.UDS.',
  ];

  const invalidNames = [
    '',
    '  ',
    '...',
    ' test.name',
    '_hmh.eng.*',
    'test name',
    'hmh.eng.*',
    'test-name-123',
    'hmh\\/.test',
    '$[hmh.co.eng]',
    invalidLongName,
  ];

  describe('validateName', () => {
    it('should allow valid names', () => {
      validNames.forEach(name => {
        expect(() => stringValidators.validateName(name)).not.to.throw();
      });
    });

    it('should reject invalid names', () => {
      expect(() => stringValidators.validateName('')).to.throw(
        errors.codes.ERROR_CODE_INVALID_NAME,
      );
      invalidNames.forEach(name => {
        expect(() => stringValidators.validateName(name)).to.throw(
          errors.codes.ERROR_CODE_INVALID_NAME,
        );
      });
    });
  });

  describe('validateURL', () => {
    it('should allow valid URLs', () => {
      validNames.forEach(name => {
        expect(() => stringValidators.validateURL(name)).not.to.throw();
      });
    });

    it('should reject invalid URLs', () => {
      expect(() => stringValidators.validateURL('')).to.throw(
        errors.codes.ERROR_CODE_INVALID_URL,
      );
      expect(() => stringValidators.validateURL(invalidLongName)).to.throw(
        errors.codes.ERROR_CODE_INVALID_URL,
      );
    });
  });

  describe('validateUser', () => {
    it('should allow valid user IDs', () => {
      validNames.forEach(name => {
        expect(() => stringValidators.validateUser(name)).not.to.throw();
      });
    });

    it('should reject invalid user IDs', () => {
      expect(() => stringValidators.validateUser('')).to.throw(
        errors.codes.ERROR_CODE_INVALID_USER,
      );
    });
  });

  describe('validateOptionalUser', () => {
    it('should allow valid optional user IDs', () => {
      expect(() => stringValidators.validateOptionalUser()).not.to.throw();
      validNames.forEach(name => {
        expect(() => stringValidators.validateOptionalUser(name)).not.to.throw();
      });
    });

    it('should reject invalid user IDs', () => {
      expect(() => stringValidators.validateOptionalUser('')).to.throw(
        errors.codes.ERROR_CODE_INVALID_USER,
      );
    });
  });

  describe('validateApp', () => {
    it('should allow valid app values', () => {
      validNames.forEach(name => {
        expect(() => stringValidators.validateApp(name)).not.to.throw();
      });
    });

    it('should reject invalid app values', () => {
      expect(() => stringValidators.validateApp('')).to.throw(
        errors.codes.ERROR_CODE_INVALID_APP,
      );
      invalidNames.forEach(name => {
        expect(() => stringValidators.validateApp(name)).to.throw(
          errors.codes.ERROR_CODE_INVALID_APP,
        );
      });
    });
  });

  describe('validateKey', () => {
    it('should allow valid key values', () => {
      validNames.forEach(name => {
        expect(() => stringValidators.validateKey(name)).not.to.throw();
      });
    });

    it('should reject invalid key values', () => {
      expect(() => stringValidators.validateKey('')).to.throw(
        errors.codes.ERROR_CODE_INVALID_KEY,
      );
      invalidNames.forEach(name => {
        expect(() => stringValidators.validateKey(name)).to.throw(
          errors.codes.ERROR_CODE_INVALID_KEY,
        );
      });
    });
  });

  describe('validateAuthz', () => {
    it('should allow valid authz IDs', () => {
      [
        'abcd1234',
        'ABCD1234abcd',
      ].forEach(type => {
        expect(() => stringValidators.validateAuthz(type)).not.to.throw();
      });
    });

    it('should reject invalid authz IDs', () => {
      function checkInvalidAuthz(value) {
        expect(() => stringValidators.validateAuthz(value)).to.throw(
          errors.codes.ERROR_CODE_INVALID_AUTHZ,
        );
      }

      // Reject strings that don't conform to a possible UDS-generated IDs
      invalidNames.forEach(s => { checkInvalidAuthz(s); });
    });
  });

  describe('validateShareId', () => {
    it('should allow valid share IDs', () => {
      expect(() => stringValidators.validateShareId(
        '12345678-abcd-efAB-CDEF-1234567890Aa',
      )).not.to.throw();
    });

    it('should reject invalid share IDs', () => {
      function checkInvalidShareId(value) {
        expect(() => stringValidators.validateShareId(value)).to.throw(
          errors.codes.ERROR_CODE_INVALID_SHARE_ID,
        );
      }

      // Reject strings that don't conform to a possible UDS-generated IDs
      [
        'abcd1234',
        'ABCD1234abcd',
      ].forEach(s => { checkInvalidShareId(s); });
      invalidNames.forEach(s => { checkInvalidShareId(s); });
    });
  });

  describe('validateCtx', () => {
    it('should allow valid context IDs', () => {
      validNames.forEach(name => {
        expect(() => stringValidators.validateCtx(name)).not.to.throw();
      });
    });

    it('should reject invalid context IDs', () => {
      expect(() => stringValidators.validateCtx('')).to.throw(
        errors.codes.ERROR_CODE_INVALID_CTX,
      );
      expect(() => stringValidators.validateCtx(invalidLongName)).to.throw(
        errors.codes.ERROR_CODE_INVALID_CTX,
      );
    });
  });

  describe('validateType', () => {
    it('should allow valid types', () => {
      [
        'text',
      ].forEach(type => {
        expect(() => stringValidators.validateType(type)).not.to.throw();
      });
    });

    it('should reject invalid types', () => {
      function checkInvalidType(value) {
        expect(() => stringValidators.validateType(value)).to.throw(
          errors.codes.ERROR_CODE_INVALID_DATA_TYPE,
        );
      }

      checkInvalidType();
      checkInvalidType('');
      checkInvalidType('other');
      checkInvalidType('invalid');
      invalidNames.forEach(checkInvalidType);
    });
  });
});
