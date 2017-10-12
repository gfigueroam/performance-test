import chai from 'chai';

import setHandler from '../../../../../../app/api/v1/data.cb/set';

const expect = chai.expect;

const key = 'test.data.user.set.name';
const data = 'Sample data value';
const user = 'hmh-test-user.123';

describe('data.cb.set', () => {
  it('returns no value', done => {
    setHandler(key, data, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
