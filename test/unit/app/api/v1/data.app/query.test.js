import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import cb from '../../../../../../app/api/v1/data.cb';
import logger from '../../../../../../app/monitoring/logger';
import queryHandler from '../../../../../../app/api/v1/data.app/query';

const expect = chai.expect;

const keyPrefix = 'test.data.app.query.name.prefix.';
const app = 'test.app.name';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };


describe('data.app.query', () => {
  before(() => {
    sinon.stub(cb, 'query');
    sinon.stub(appData, 'query');
  });

  after(() => {
    cb.query.restore();
    appData.query.restore();
  });

  it('returns a list of items matching query from app data', done => {
    const items = [
      { app, createdBy: requestor, data: true, key: 'k1', user: requestor },
      { app, createdBy: requestor, data: 'value', key: 'k2', user: requestor },
    ];

    const expected = [
      { app, createdBy: requestor, data: true, key: 'k1', updatedBy: undefined },
      { app, createdBy: requestor, data: 'value', key: 'k2', updatedBy: undefined },
    ];
    appData.query.callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        keyPrefix,
        owner: undefined,
        requestor,
      });

      return Promise.resolve(items);
    });
    queryHandler.apply(swatchCtx, [keyPrefix, app, requestor]).then(result => {
      expect(result).to.deep.equal(expected);
      expect(appData.query.called).to.equal(true);

      done();
    }).catch(done);
  });

  it('returns undefined if there is no DynamoDB item in app data', done => {
    appData.query.callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        keyPrefix,
        owner: undefined,
        requestor,
      });

      return Promise.resolve(undefined);
    });
    queryHandler.apply(swatchCtx, [keyPrefix, app, requestor]).then(result => {
      expect(result).to.equal(undefined);
      expect(appData.query.called).to.equal(true);

      done();
    }).catch(done);
  });

  it('returns an empty list if there are no items in cb data', done => {
    cb.query.callsFake((k, r, o) => {
      expect(k).to.equal(keyPrefix);
      expect(r).to.equal(requestor);
      expect(o).to.equal(requestor);
      return Promise.resolve([]);
    });

    const params = [keyPrefix, 'cb', requestor, requestor];
    queryHandler.apply(swatchCtx, params).then(result => {
      expect(result).to.deep.equal([]);
      done();
    }).catch(done);
  });
});
