import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import logger from '../../../../../../app/monitoring/logger';
import listHandler from '../../../../../../app/api/v1/data.app/json.list';

const expect = chai.expect;

const app = 'test.data.app.json.list.app';
const user = 'hmh-test-user.123';
const swatchCtx = { logger };

describe('data.app.json.list', () => {
  after(() => {
    appData.listJson.restore();
  });
  it('returns an empty stub value', done => {
    sinon.stub(appData, 'listJson').callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        user,
      });
      return Promise.resolve({
        Items: [],
      });
    });
    listHandler.apply(swatchCtx, [app, user]).then(result => {
      expect(result).to.deep.equal({
        keys: [],
      });
      done();
    }).catch(done);
  });
});
