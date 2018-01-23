import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import logger from '../../../../../../app/monitoring/logger';
import getHandler from '../../../../../../app/api/v1/data.app/get';

const expect = chai.expect;

const key = 'test.data.app.get.key';
const app = 'test.data.app.get.app';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };

describe('data.app.get', () => {
  after(() => {
    appData.get.restore();
  });
  it('returns an empty stub value', done => {
    sinon.stub(appData, 'get').callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        key,
        owner: undefined,
        requestor,
      });
      return Promise.resolve({
        Item: undefined,
      });
    });
    getHandler.apply(swatchCtx, [key, app, requestor]).then(result => {
      expect(result).to.deep.equal(undefined);
      done();
    }).catch(done);
  });
});
