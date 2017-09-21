import chai from 'chai';

import setHandler from '../../../../../../app/api/v1/data.app/blob.set';

const expect = chai.expect;

const app = 'test.data.app.blob.set.app';
const password = 'testpassword1234';
const user = 'hmh-test-user.123';

describe('data.app.blob.set', () => {
  it('returns no value', done => {
    setHandler(app, password, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
