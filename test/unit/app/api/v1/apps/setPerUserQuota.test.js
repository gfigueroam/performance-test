import chai from 'chai';
import sinon from 'sinon';

import apps from '../../../../../../app/db/apps';
import setPerUserQuotaHandler from '../../../../../../app/api/v1/apps/setPerUserQuota';

const expect = chai.expect;

const name = 'test.apps.setPerUserQuota.name';
const quota = 1024;

describe('apps.setPerUserQuota', () => {
  after(() => {
    apps.setQuota.restore();
  });

  it('returns no value', done => {
    sinon.stub(apps, 'setQuota').callsFake((params) => {
      expect(params).to.deep.equal({
        name,
        quota,
      });
    });
    setPerUserQuotaHandler(name, quota).then(result => {
      expect(result).to.equal(undefined);
      expect(apps.setQuota.called).to.equal(true);
      done();
    }).catch(done);
  });
});
