import chai from 'chai';

import errors from '../../../../../app/models/errors';
import objectValidators from '../../../../../app/api/validators/objects';

const expect = chai.expect;

describe('Object Validators', () => {
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

  describe('validateJsonData', () => {
    it('should allow a valid object', () => {
      expect(() => objectValidators.validateJsonData({ a: true })).not.to.throw();
      expect(() => objectValidators.validateJsonData({ a: 'a', b: 'b' })).not.to.throw();
    });

    it('should require a non-empty object', () => {
      const error = errors.codes.ERROR_CODE_INVALID_DATA;
      expect(() => objectValidators.validateJsonData({})).to.throw(error);
    });
  });
});
