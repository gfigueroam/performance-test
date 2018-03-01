import chai from 'chai';
import sinon from 'sinon';

import apps from '../../../../../../app/db/apps';
import logger from '../../../../../../app/monitoring/logger';
import removePerUserQuotaHandler from '../../../../../../app/api/v1/apps/removePerUserQuota';

const expect = chai.expect;

const name = 'test.apps.removePerUserQuota.name';
const swatchCtx = { logger };

describe('apps.removePerUserQuota', () => {
  after(() => {
    apps.removeQuota.restore();
  });

  it('returns no value', done => {
    sinon.stub(apps, 'removeQuota').callsFake((params) => {
      expect(params).to.deep.equal({ name });
    });
    removePerUserQuotaHandler.apply(swatchCtx, [name]).then(result => {
      expect(result).to.equal(undefined);
      expect(apps.removeQuota.called).to.equal(true);
      done();
    }).catch(done);
  });
});
