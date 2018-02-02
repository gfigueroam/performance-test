import chai from 'chai';
import sinon from 'sinon';

import getSharedHandler from '../../../../../../app/api/v1/data.user/getShared';
import logger from '../../../../../../app/monitoring/logger';
import share from '../../../../../../app/db/share';

const expect = chai.expect;

const swatchCtx = { logger };

const shareId = 'test-share-id';
const requestor = 'some-user-requesting';

const mockDataItem = {
  data: 'some-data-value',
  key: 'some-data-key',
};

let getSharedStub;

describe('data.user.getShared', () => {
  before(() => {
    getSharedStub = sinon.stub(share, 'getShared');
  });

  after(() => {
    share.getShared.restore();
  });

  it('returns the data value when an item is returned', done => {
    getSharedStub.callsFake((params) => {
      expect(params).to.deep.equal({
        id: shareId,
        requestor,
      });

      return Promise.resolve(mockDataItem);
    });
    getSharedHandler.apply(swatchCtx, [shareId, requestor]).then(result => {
      expect(result).to.deep.equal(mockDataItem);
      done();
    }).catch(done);
  });
});
