import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../../../app/db/appData';
import logger from '../../../../../../app/monitoring/logger';
import queryHandler from '../../../../../../app/api/v1/data.app/query';

const expect = chai.expect;

const keyPrefix = 'test.data.app.query.name.prefix.';
const app = 'test.app.name';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };

let queryStub;

describe('data.app.query', () => {
  before(() => {
    queryStub = sinon.stub(appData, 'query');
  });

  after(() => {
    appData.query.restore();
  });

  it('returns a list of items matching query', done => {
    const items = [
      { app, data: true, key: 'k1', user: requestor },
      { app, data: 'value', key: 'k2', user: requestor },
    ];
    queryStub.callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        keyPrefix,
        owner: undefined,
        requestor,
      });

      return Promise.resolve({
        Items: items,
      });
    });
    queryHandler.apply(swatchCtx, [keyPrefix, app, requestor]).then(result => {
      expect(result).to.deep.equal(items);
      expect(appData.query.called).to.equal(true);

      done();
    }).catch(done);
  });

  it('returns undefined if there is no DynamoDB item', done => {
    queryStub.callsFake((params) => {
      expect(params).to.deep.equal({
        app,
        keyPrefix,
        owner: undefined,
        requestor,
      });

      return Promise.resolve({});
    });
    queryHandler.apply(swatchCtx, [keyPrefix, app, requestor]).then(result => {
      expect(result).to.equal(undefined);
      expect(appData.query.called).to.equal(true);

      done();
    }).catch(done);
  });
});
