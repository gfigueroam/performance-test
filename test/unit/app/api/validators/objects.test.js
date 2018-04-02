import chai from 'chai';

import errors from '../../../../../app/models/errors';
import objectValidators from '../../../../../app/api/validators/objects';

const expect = chai.expect;

describe('validators.objects', () => {
  describe('validateTextData', () => {
    it('should allow valid text data', () => {
      expect(() => objectValidators.validateTextData('text')).not.to.throw();
      expect(() => objectValidators.validateTextData('Some custom note')).not.to.throw();
      expect(() => objectValidators.validateTextData('User-generated content')).not.to.throw();
    });

    it('should require non-empty text values', () => {
      const error = errors.codes.ERROR_CODE_INVALID_DATA;
      expect(() => objectValidators.validateTextData('')).to.throw(error);
    });
  });
});
