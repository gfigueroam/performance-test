import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import cb from '../../../../../../app/api/v1/data.cb';
import logger from '../../../../../../app/monitoring/logger';
import mergeHandler from '../../../../../../app/api/v1/data.app/merge';

const expect = chai.expect;

const key = 'test.data.app.merge.key';
const data = { additionalKey: true };
const app = 'test.data.app.merge.app';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };


describe('data.app.merge', () => {
  before(() => {
    sinon.stub(cb, 'merge');
    sinon.stub(appData, 'merge');
  });

  after(() => {
    cb.merge.restore();
    appData.merge.restore();
  });

  it('returns the new data value and the key from app data', done => {
    appData.merge.callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        data,
        key,
        owner: undefined,
        requestor,
      });
      return Promise.resolve(data);
    });

    mergeHandler.apply(swatchCtx, [key, data, app, requestor]).then(result => {
      expect(result).to.deep.equal({
        data,
        key,
      });
      done();
    }).catch(done);
  });

  it('returns no data value from cb data', done => {
    cb.merge.callsFake((k, d, r, o) => {
      expect(k).to.equal(key);
      expect(d).to.deep.equal(data);
      expect(r).to.equal(requestor);
      expect(o).to.equal(requestor);
      return Promise.resolve(undefined);
    });

    const params = [key, data, 'cb', requestor, requestor];
    mergeHandler.apply(swatchCtx, params).then(result => {
      expect(result).to.equal(undefined);
      done();
    }).catch(done);
  });
});
