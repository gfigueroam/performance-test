import chai from 'chai';

import setHandler from '../../../../../../app/api/v1/data.user/set';

const expect = chai.expect;

const key = 'test.data.user.set.name';
const type = 'test';
const data = 'Sample custom user text';
const user = 'hmh-test-user.123';

describe('data.user.set', () => {
  it('returns no value', done => {
    setHandler(key, type, data, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
