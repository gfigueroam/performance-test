import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import cb from '../../../../../../app/api/v1/data.cb';
import logger from '../../../../../../app/monitoring/logger';
import deleteHandler from '../../../../../../app/api/v1/data.app/delete';

const expect = chai.expect;

const key = 'test.data.app.delete.key';
const app = 'test.data.app.delete.app';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };


describe('data.app.delete', () => {
  before(() => {
    sinon.stub(cb, 'unset');
    sinon.stub(appData, 'unset');
  });

  after(() => {
    cb.unset.restore();
    appData.unset.restore();
  });

  it('returns no value when removing app data', done => {
    appData.unset.callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        key,
        owner: undefined,
        requestor,
      });
      return Promise.resolve(undefined);
    });
    deleteHandler.apply(swatchCtx, [key, app, requestor]).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });

  it('returns no value when removing cb data', done => {
    cb.unset.callsFake((k, o, r) => {
      expect(k).to.equal(key);
      expect(o).to.equal(requestor);
      expect(r).to.equal(requestor);
      return Promise.resolve(undefined);
    });
    deleteHandler.apply(swatchCtx, [key, 'cb', requestor, requestor]).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
