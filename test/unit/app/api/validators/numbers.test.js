import chai from 'chai';

import errors from '../../../../../app/models/errors';
import numbersValidators from '../../../../../app/api/validators/numbers';

const expect = chai.expect;

describe('validators.numbers', () => {
  describe('validateQuota', () => {
    it('should allow valid quota amounts', () => {
      expect(() => numbersValidators.validateQuota(1)).not.to.throw();
      expect(() => numbersValidators.validateQuota(1024)).not.to.throw();
      expect(() => numbersValidators.validateQuota(4096)).not.to.throw();
      expect(() => numbersValidators.validateQuota(262144)).not.to.throw();
      expect(() => numbersValidators.validateQuota(1048576)).not.to.throw();
    });

    it('should require positive quota amounts below system-wide limit', () => {
      const error = errors.codes.ERROR_CODE_INVALID_QUOTA;

      expect(() => numbersValidators.validateQuota(0)).to.throw(error);
      expect(() => numbersValidators.validateQuota(-1024)).to.throw(error);
      expect(() => numbersValidators.validateQuota(2097152)).to.throw(error);
    });
  });
});
