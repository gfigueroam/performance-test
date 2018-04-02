import chai from 'chai';

import errors from '../../../../../app/models/errors';

const expect = chai.expect;


describe('system.errors', () => {
  it('should have a fixed number of error codes', () => {
    expect(Object.keys(errors.codes).length).to.equal(26);
  });
});
