import chai from 'chai';

import getHandler from '../../../../../../app/api/v1/data.cb/get';

const expect = chai.expect;

const key = 'test.data.user.get.name';
const user = 'hmh-test-user.123';

describe('data.cb.get', () => {
  it('returns no value', done => {
    getHandler(key, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
