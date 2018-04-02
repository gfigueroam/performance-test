import chai from 'chai';

import system from '../../../../../app/models/system';

const expect = chai.expect;


describe('system.types', () => {
  it('should have loaded schemas for each type with validators', () => {
    expect(Object.keys(system.types)).to.deep.equal(
      ['text', 'annotation', 'document', 'image', 'video'],
    );
    expect(system.types.text.validate(10000)).to.equal(false);
    expect(system.types.text.validate('sample text')).to.equal(true);

    expect(system.types.annotation.validate({})).to.equal(false);
    expect(system.types.annotation.validate({
      createdAt: 10000,
      createdBy: 'test-user',
      text: 'annotation text',
    })).to.equal(true);
  });
});
