import chai from 'chai';
import sinon from 'sinon';

import logger from '../../../../../../app/monitoring/logger';
import share from '../../../../../../app/db/share';
import unshareHandler from '../../../../../../app/api/v1/data.user/unshare';

const expect = chai.expect;

const swatchCtx = { logger };

const id = 'test.data.user.unshare.id';
const requestor = 'hmh-test-user.123';


describe('data.user.unshare', () => {
  after(() => {
    share.unshare.restore();
  });

  it('returns no value', done => {
    sinon.stub(share, 'unshare').callsFake((params) => {
      expect(params).to.deep.equal({
        id,
        owner: undefined,
        requestor,
      });
    });
    unshareHandler.apply(swatchCtx, [id, requestor]).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
