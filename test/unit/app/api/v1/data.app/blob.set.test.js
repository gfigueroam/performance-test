import chai from 'chai';

import setHandler from '../../../../../../app/api/v1/data.app/blob.set';

const expect = chai.expect;

const app = 'test.data.app.blob.set.app';
const user = 'hmh-test-user.123';

describe('data.app.blob.set', () => {
  it('returns no value', done => {
    setHandler(app, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
