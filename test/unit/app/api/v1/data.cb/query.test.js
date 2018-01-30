import chai from 'chai';
import sinon from 'sinon';

import calculatedBehavior from '../../../../../../app/db/calculatedBehavior';
import logger from '../../../../../../app/monitoring/logger';
import queryHandler from '../../../../../../app/api/v1/data.cb/query';

const expect = chai.expect;

const keyPrefix = 'test.data.user.query.name.prefix.';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };

let queryStub;

describe('data.cb.query', () => {
  before(() => {
    queryStub = sinon.stub(calculatedBehavior, 'query');
  });

  after(() => {
    calculatedBehavior.query.restore();
  });

  it('returns a list of items matching query', done => {
    const items = [
      { key1: true },
      { key2: 'value' },
    ];
    queryStub.callsFake((params) => {
      expect(params).to.deep.equal({
        keyPrefix,
        owner: undefined,
        requestor,
      });

      return Promise.resolve(items);
    });
    queryHandler.apply(swatchCtx, [keyPrefix, requestor]).then(result => {
      expect(result).to.deep.equal(items);
      expect(calculatedBehavior.query.called).to.equal(true);

      done();
    }).catch(done);
  });

  it('returns empty array if there is no DynamoDB items', done => {
    queryStub.callsFake((params) => {
      expect(params).to.deep.equal({
        keyPrefix,
        owner: undefined,
        requestor,
      });

      return Promise.resolve([]);
    });
    queryHandler.apply(swatchCtx, [keyPrefix, requestor]).then(result => {
      expect(result).to.deep.equal([]);
      expect(calculatedBehavior.query.called).to.equal(true);

      done();
    }).catch(done);
  });
});
