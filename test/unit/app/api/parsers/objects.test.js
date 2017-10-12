import chai from 'chai';

import errors from '../../../../../app/models/errors';
import objectParsers from '../../../../../app/api/parsers/objects';

const expect = chai.expect;

describe('Object Parsers', () => {
  describe('parseData', () => {
    it('should parse and return an arbitrary data value', () => {
      function checkTargetObject(obj) {
        const result = objectParsers.parseData(obj);
        expect(result).to.deep.equal(obj);
      }

      // Check that it properly parses objects with expected keys
      const t1 = { id: 'test.id', type: 'student' };
      checkTargetObject(t1);

      const t2 = { id: ' some item', type: ' district   ' };
      checkTargetObject(t2);

      const t3 = { id: 'teacher-id1', other: 100, type: 'teacher' };
      checkTargetObject(t3);

      // Check that it allows booleans, numbers, strings, and arrays
      checkTargetObject('a');
      checkTargetObject(100);
      checkTargetObject(true);
      checkTargetObject(false);
      checkTargetObject('false');
      checkTargetObject([1, 2, 3]);
    });

    it('should throw an error parsing an empty value', () => {
      const error = errors.codes.ERROR_CODE_INVALID_DATA;

      // Check that it rejects false-y empty input values
      expect(() => objectParsers.parseData(null)).to.throw(error);
      expect(() => objectParsers.parseData(undefined)).to.throw(error);
    });
  });

  describe('parseJsonData', () => {
    it('should parse and return a serialized JSON document', () => {
      function checkTargetObject(obj) {
        const result = objectParsers.parseJsonData(obj);
        expect(result).to.deep.equal(obj);
      }

      // Check that it properly parses objects with expected keys
      const t1 = { id: 'test.id', type: 'student' };
      checkTargetObject(t1);

      const t2 = { id: ' some item', type: ' district   ' };
      checkTargetObject(t2);

      const t3 = { id: 'teacher-id1', other: 100, type: 'teacher' };
      checkTargetObject(t3);
    });

    it('should throw an error parsing a non-dict object', () => {
      const error = errors.codes.ERROR_CODE_INVALID_DATA;

      // Check that it rejects false-y input values
      expect(() => objectParsers.parseJsonData(null)).to.throw(error);
      expect(() => objectParsers.parseJsonData(undefined)).to.throw(error);

      // Check that it rejects values that are not objects
      expect(() => objectParsers.parseJsonData('a')).to.throw(error);
      expect(() => objectParsers.parseJsonData(100)).to.throw(error);
      expect(() => objectParsers.parseJsonData(true)).to.throw(error);
      expect(() => objectParsers.parseJsonData(false)).to.throw(error);
      expect(() => objectParsers.parseJsonData('false')).to.throw(error);
      expect(() => objectParsers.parseJsonData([1, 2, 3])).to.throw(error);
    });
  });
});
