import chai from 'chai';

import shareHandler from '../../../../../../app/api/v1/data.user/share';

const expect = chai.expect;

const key = 'test.data.user.share.name';
const authz = 'test.authz.id';
const ctx = 'authz-context-1';
const requestor = 'hmh-test-user.123';

describe('data.user.share', () => {
  it('returns a stub value', done => {
    shareHandler(key, authz, ctx, requestor).then(result => {
      expect(result).to.deep.equal({});
      done();
    }).catch(done);
  });
});
