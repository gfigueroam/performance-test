import chai from 'chai';
import sinon from 'sinon';

import calculatedBehavior from '../../../../../../app/db/calculatedBehavior';
import logger from '../../../../../../app/monitoring/logger';
import queryHandler from '../../../../../../app/api/v1/data.cb/query';

const expect = chai.expect;

const keyPrefix = 'test.data.user.query.name.prefix.';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };


describe('data.cb.query', () => {
  before(() => {
    sinon.stub(calculatedBehavior, 'query');
  });

  after(() => {
    calculatedBehavior.query.restore();
  });

  it('returns a list of items matching query', done => {
    const items = [
      { data: true, key: 'key1' },
      { data: 'value', key: 'key2' },
    ];
    calculatedBehavior.query.callsFake((params) => {
      expect(params).to.deep.equal({
        keyPrefix,
        owner: undefined,
        requestor,
      });

      return Promise.resolve(items);
    });
    queryHandler.apply(swatchCtx, [keyPrefix, requestor]).then(result => {
      expect(result).to.deep.equal([
        {
          app: 'cb',
          createdBy: undefined,
          data: true,
          key: 'key1',
          updatedBy: undefined,
        },
        {
          app: 'cb',
          createdBy: undefined,
          data: 'value',
          key: 'key2',
          updatedBy: undefined,
        },
      ]);
      expect(calculatedBehavior.query.called).to.equal(true);

      done();
    }).catch(done);
  });

  it('returns empty array if there is no DynamoDB items', done => {
    calculatedBehavior.query.callsFake((params) => {
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
