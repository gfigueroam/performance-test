import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import logger from '../../../../../../app/monitoring/logger';
import deleteHandler from '../../../../../../app/api/v1/data.app/json.delete';

const expect = chai.expect;

const key = 'test.data.app.json.delete.key';
const app = 'test.data.app.json.delete.app';
const user = 'hmh-test-user.123';
const swatchCtx = { logger };

describe('data.app.json.delete', () => {
  after(() => {
    appData.unsetJson.restore();
  });

  it('returns no value', done => {
    sinon.stub(appData, 'unsetJson').callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        key,
        user,
      });
      return Promise.resolve(undefined);
    });
    deleteHandler.apply(swatchCtx, [key, app, user]).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
