import chai from 'chai';

import deleteHandler from '../../../../../../app/api/v1/data.app/blob.delete';

const expect = chai.expect;

const app = 'test.data.app.blob.delete.app';
const user = 'hmh-test-user.123';

describe('data.app.blob.delete', () => {
  it('returns no value', done => {
    deleteHandler(app, user).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
