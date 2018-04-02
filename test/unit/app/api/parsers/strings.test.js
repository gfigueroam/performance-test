import chai from 'chai';

import stringParsers from '../../../../../app/api/parsers/strings';

const expect = chai.expect;

describe('parsers.strings', () => {
  describe('parseString', () => {
    it('should parse and coerce params to string', () => {
      expect(stringParsers.parseString()).to.equal('');
      expect(stringParsers.parseString('')).to.equal('');
      expect(stringParsers.parseString(null)).to.equal('');
      expect(stringParsers.parseString(undefined)).to.equal('');

      expect(stringParsers.parseString('value')).to.equal('value');
      expect(stringParsers.parseString('argument1')).to.equal('argument1');
      expect(stringParsers.parseString(' a_value  ')).to.equal('a_value');
      expect(stringParsers.parseString('test.value')).to.equal('test.value');

      expect(stringParsers.parseString(100)).to.equal('100');
      expect(stringParsers.parseString(12345)).to.equal('12345');

      expect(stringParsers.parseString(true)).to.equal('true');
      expect(stringParsers.parseString(false)).to.equal('false');

      expect(stringParsers.parseString(['a', 'b', 'c'])).to.equal('a,b,c');
    });
  });

  describe('parseOptionalString', () => {
    it('should parse and coerce params to string but allow undefined', () => {
      expect(stringParsers.parseOptionalString()).to.equal(undefined);
      expect(stringParsers.parseOptionalString(null)).to.equal(undefined);
      expect(stringParsers.parseOptionalString(undefined)).to.equal(undefined);

      expect(stringParsers.parseOptionalString('')).to.equal('');

      expect(stringParsers.parseOptionalString('value')).to.equal('value');
      expect(stringParsers.parseOptionalString('argument1')).to.equal('argument1');
      expect(stringParsers.parseOptionalString(' a_value  ')).to.equal('a_value');
      expect(stringParsers.parseOptionalString('test.value')).to.equal('test.value');

      expect(stringParsers.parseOptionalString(100)).to.equal('100');
      expect(stringParsers.parseOptionalString(12345)).to.equal('12345');

      expect(stringParsers.parseOptionalString(true)).to.equal('true');
      expect(stringParsers.parseOptionalString(false)).to.equal('false');

      expect(stringParsers.parseOptionalString(['a', 'b', 'c'])).to.equal('a,b,c');
    });
  });
});
