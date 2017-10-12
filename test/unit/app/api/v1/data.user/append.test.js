import chai from 'chai';

import appendHandler from '../../../../../../app/api/v1/data.user/append';

const expect = chai.expect;

const key = 'test.data.user.append.name';
const type = 'test';
const data = 'Sample custom user text';
const user = 'hmh-test-user.123';

describe('data.user.append', () => {
  it('returns no value', done => {
    appendHandler(key, type, data, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
