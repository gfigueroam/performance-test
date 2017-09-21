import chai from 'chai';

import getHandler from '../../../../../../app/api/v1/data.user/get';

const expect = chai.expect;

const key = 'test.data.user.get.name';
const user = 'hmh-test-user.123';

describe('data.user.get', () => {
  it('returns an empty stub value', done => {
    getHandler(key, user).then(result => {
      expect(result).to.deep.equal({});
      done();
    }).catch(done);
  });
});
