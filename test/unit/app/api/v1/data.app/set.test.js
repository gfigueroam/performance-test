import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import logger from '../../../../../../app/monitoring/logger';
import setHandler from '../../../../../../app/api/v1/data.app/set';

const expect = chai.expect;

const key = 'test.data.app.set.key';
const data = { additionalKey: true };
const app = 'test.data.app.set.app';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };

describe('data.app.set', () => {
  after(() => {
    appData.set.restore();
  });
  it('returns no value', done => {
    sinon.stub(appData, 'set').callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        data,
        key,
        owner: undefined,
        requestor,
      });
      return Promise.resolve(undefined);
    });
    setHandler.apply(swatchCtx, [key, data, app, requestor]).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
