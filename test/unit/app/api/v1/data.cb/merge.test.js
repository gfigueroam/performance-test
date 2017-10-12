import chai from 'chai';

import mergeHandler from '../../../../../../app/api/v1/data.cb/merge';

const expect = chai.expect;

const key = 'test.data.user.merge.name';
const data = { k1: 'Hello', k2: 'Goodbye' };
const user = 'hmh-test-user.123';

describe('data.cb.merge', () => {
  it('returns no value', done => {
    mergeHandler(key, data, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
