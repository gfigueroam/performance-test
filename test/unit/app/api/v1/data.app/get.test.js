import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import cb from '../../../../../../app/api/v1/data.cb';
import logger from '../../../../../../app/monitoring/logger';
import getHandler from '../../../../../../app/api/v1/data.app/get';

const expect = chai.expect;

const key = 'test.data.app.get.key';
const app = 'test.data.app.get.app';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };


describe('data.app.get', () => {
  before(() => {
    sinon.stub(cb, 'get');
    sinon.stub(appData, 'get');
  });

  after(() => {
    cb.get.restore();
    appData.get.restore();
  });

  it('returns an empty stub value when getting app data', done => {
    appData.get.callsFake((params) => {
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
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });

  it('returns an empty stub value when getting cb data', done => {
    cb.get.callsFake((k, r, o) => {
      expect(k).to.equal(key);
      expect(o).to.equal(requestor);
      expect(r).to.equal(requestor);
      return Promise.resolve(undefined);
    });
    getHandler.apply(swatchCtx, [key, 'cb', requestor, requestor]).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
