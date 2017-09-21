import chai from 'chai';

import setPerUserQuotaHandler from '../../../../../../app/api/v1/apps/setPerUserQuota';

const expect = chai.expect;

const name = 'test.apps.setPerUserQuota.name';
const quota = 1024;

describe('apps.setPerUserQuota', () => {
  it('returns no value', done => {
    setPerUserQuotaHandler(name, quota).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
