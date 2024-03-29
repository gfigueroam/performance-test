import chai from 'chai';
import sinon from 'sinon';

import logger from '../../../../../../app/monitoring/logger';
import queryHandler from '../../../../../../app/api/v1/data.user/query';
import userData from '../../../../../../app/db/userData';

const expect = chai.expect;

const keyPrefix = 'test.data.user.query.name.prefix.';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };


describe('data.user.query', () => {
  before(() => {
    sinon.stub(userData, 'query');
  });

  after(() => {
    userData.query.restore();
  });

  it('returns a list of items matching query', done => {
    const items = [
      { createdBy: requestor, data: 'true', key: 'k1', type: 'text', updatedBy: requestor, user: requestor },
      { createdBy: requestor, data: 'value', key: 'k2', type: 'text', updatedBy: requestor, user: requestor },
    ];

    const expected = items.map((item) => { delete item.user; return item; });
    userData.query.callsFake((params) => {
      expect(params).to.deep.equal({
        keyPrefix,
        owner: undefined,
        requestor,
      });

      return Promise.resolve(items);
    });
    queryHandler.apply(swatchCtx, [keyPrefix, requestor]).then(result => {
      expect(result).to.deep.equal(expected);
      expect(userData.query.called).to.equal(true);

      done();
    }).catch(done);
  });

  it('returns undefined if there is no DynamoDB item', done => {
    userData.query.callsFake((params) => {
      expect(params).to.deep.equal({
        keyPrefix,
        owner: undefined,
        requestor,
      });

      return Promise.resolve();
    });
    queryHandler.apply(swatchCtx, [keyPrefix, requestor]).then(result => {
      expect(result).to.equal(undefined);
      expect(userData.query.called).to.equal(true);

      done();
    }).catch(done);
  });
});
