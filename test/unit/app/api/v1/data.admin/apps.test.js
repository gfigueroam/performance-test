import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import logger from '../../../../../../app/monitoring/logger';
import appsHandler from '../../../../../../app/api/v1/data.admin/apps';

const expect = chai.expect;

const user = 'hmh-test-user.123';
const swatchCtx = { logger };

describe('data.admin.apps', () => {
  after(() => {
    appData.getApps.restore();
  });

  it('returns an empty stub array', done => {
    sinon.stub(appData, 'getApps').callsFake((params) => {
      expect(params).to.deep.equal({
        user,
      });
      return Promise.resolve([]);
    });
    appsHandler.apply(swatchCtx, [user]).then(result => {
      expect(result).to.deep.equal([]);
      done();
    }).catch(done);
  });
});
