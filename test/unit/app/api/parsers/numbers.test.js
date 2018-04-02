import chai from 'chai';

import errors from '../../../../../app/models/errors';
import numberParsers from '../../../../../app/api/parsers/numbers';

const expect = chai.expect;

describe('parsers.numbers', () => {
  describe('parseQuota', () => {
    it('should throw an error for invalid number param', () => {
      expect(() => numberParsers.parseQuota()).to.throw(
        errors.codes.ERROR_CODE_INVALID_QUOTA,
      );
      expect(() => numberParsers.parseQuota(null)).to.throw(
        errors.codes.ERROR_CODE_INVALID_QUOTA,
      );
      expect(() => numberParsers.parseQuota(undefined)).to.throw(
        errors.codes.ERROR_CODE_INVALID_QUOTA,
      );

      expect(() => numberParsers.parseQuota('val')).to.throw(
        errors.codes.ERROR_CODE_INVALID_QUOTA,
      );
      expect(() => numberParsers.parseQuota([1, 2, 3])).to.throw(
        errors.codes.ERROR_CODE_INVALID_QUOTA,
      );
      expect(() => numberParsers.parseQuota(['a', 'b', 'c'])).to.throw(
        errors.codes.ERROR_CODE_INVALID_QUOTA,
      );
      expect(() => numberParsers.parseQuota({})).to.throw(
        errors.codes.ERROR_CODE_INVALID_QUOTA,
      );
      expect(() => numberParsers.parseQuota({ key: 2 })).to.throw(
        errors.codes.ERROR_CODE_INVALID_QUOTA,
      );
    });

    it('should parse and coerce param to number', () => {
      expect(numberParsers.parseQuota(0)).to.equal(0);
      expect(numberParsers.parseQuota(10)).to.equal(10);
      expect(numberParsers.parseQuota(-20)).to.equal(-20);

      expect(numberParsers.parseQuota('0')).to.equal(0);
      expect(numberParsers.parseQuota('1')).to.equal(1);
      expect(numberParsers.parseQuota('-11')).to.equal(-11);

      expect(numberParsers.parseQuota(true)).to.equal(1);
      expect(numberParsers.parseQuota(false)).to.equal(0);

      expect(numberParsers.parseQuota([])).to.equal(0);
      expect(numberParsers.parseQuota([10])).to.equal(10);
    });
  });
});
