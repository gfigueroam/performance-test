import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import logger from '../../../../../../app/monitoring/logger';
import setHandler from '../../../../../../app/api/v1/data.app/json.set';

const expect = chai.expect;

const key = 'test.data.app.json.set.key';
const data = { additionalKey: true };
const app = 'test.data.app.json.set.app';
const user = 'hmh-test-user.123';
const swatchCtx = { logger };

describe('data.app.json.set', () => {
  after(() => {
    appData.setJson.restore();
  });
  it('returns no value', done => {
    sinon.stub(appData, 'setJson').callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        data,
        key,
        user,
      });
      return Promise.resolve(undefined);
    });
    setHandler.apply(swatchCtx, [key, data, app, user]).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
