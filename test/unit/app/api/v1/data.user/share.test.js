import chai from 'chai';
import sinon from 'sinon';

import logger from '../../../../../../app/monitoring/logger';
import share from '../../../../../../app/db/share';
import shareHandler from '../../../../../../app/api/v1/data.user/share';

const expect = chai.expect;

const key = 'test.data.user.share.name';
const authz = 'test.authz.id';
const ctx = 'authz-context-1';
const owner = 'hmh-test-user.234';
const requestor = 'hmh-test-user.123';

const swatchCtx = { logger };


describe('data.user.share', () => {
  before(() => {
    sinon.stub(share, 'share');
  });

  after(() => {
    share.share.restore();
  });

  it('returns the new share id when sharing is successful', done => {
    share.share.callsFake((params) => {
      expect(params).to.deep.equal({
        authz,
        ctx,
        key,
        owner,
        requestor,
      });

      return Promise.resolve('example-share-id');
    });
    shareHandler.apply(swatchCtx, [key, authz, ctx, requestor, owner]).then(result => {
      expect(result).to.deep.equal({ id: 'example-share-id' });
      done();
    }).catch(done);
  });
});
