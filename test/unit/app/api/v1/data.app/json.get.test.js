import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import logger from '../../../../../../app/monitoring/logger';
import getHandler from '../../../../../../app/api/v1/data.app/json.get';

const expect = chai.expect;

const key = 'test.data.app.json.get.key';
const app = 'test.data.app.json.get.app';
const user = 'hmh-test-user.123';
const swatchCtx = { logger };

describe('data.app.json.get', () => {
  after(() => {
    appData.getJson.restore();
  });
  it('returns an empty stub value', done => {
    sinon.stub(appData, 'getJson').callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        key,
        user,
      });
      return Promise.resolve({
        Item: undefined,
      });
    });
    getHandler.apply(swatchCtx, [key, app, user]).then(result => {
      expect(result).to.deep.equal(undefined);
      done();
    }).catch(done);
  });
});
