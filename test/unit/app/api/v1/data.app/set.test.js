import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import cb from '../../../../../../app/api/v1/data.cb';
import logger from '../../../../../../app/monitoring/logger';
import setHandler from '../../../../../../app/api/v1/data.app/set';

const expect = chai.expect;

const key = 'test.data.app.set.key';
const data = { additionalKey: true };
const app = 'test.data.app.set.app';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };


describe('data.app.set', () => {
  before(() => {
    sinon.stub(cb, 'set');
    sinon.stub(appData, 'set');
  });

  after(() => {
    cb.set.restore();
    appData.set.restore();
  });

  it('returns no value from app data', done => {
    appData.set.callsFake((params) => {
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

  it('returns no value from cb data', done => {
    cb.set.callsFake((k, d, r, o) => {
      expect(k).to.equal(key);
      expect(d).to.deep.equal(data);
      expect(r).to.equal(requestor);
      expect(o).to.equal(requestor);
      return Promise.resolve(undefined);
    });

    const params = [key, data, 'cb', requestor, requestor];
    setHandler.apply(swatchCtx, params).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
