import chai from 'chai';
import sinon from 'sinon';

import calculatedBehavior from '../../../../../../app/db/calculatedBehavior';
import logger from '../../../../../../app/monitoring/logger';
import getHandler from '../../../../../../app/api/v1/data.cb/get';

const expect = chai.expect;

const key = 'test.data.user.set.name';
const requestor = 'hmh-test-user.123';
const swatchCtx = { logger };


describe('data.cb.get', () => {
  before(() => {
    sinon.stub(calculatedBehavior, 'get');
  });

  after(() => {
    calculatedBehavior.get.restore();
  });

  it('returns an object value', done => {
    const val = {
      key1: true,
      key2: 4,
      key3: 'string value',
      key4: [1, 2, 3],
      key5: {
        anotherKey: 5,
      },
    };
    calculatedBehavior.get.callsFake((params) => {
      expect(params).to.deep.equal({
        key,
        owner: undefined,
        requestor,
      });

      return Promise.resolve({
        Item: {
          createdBy: requestor,
          data: val,
          key,
          user: requestor,
        },
      });
    });
    getHandler.apply(swatchCtx, [key, requestor]).then(result => {
      expect(result).to.deep.equal({
        createdBy: requestor,
        data: val,
        key,
        updatedBy: undefined,
      });
      expect(calculatedBehavior.get.called).to.equal(true);

      done();
    }).catch(done);
  });

  it('returns undefined if there is no DynamoDB item', done => {
    calculatedBehavior.get.callsFake((params) => {
      expect(params).to.deep.equal({
        key,
        owner: undefined,
        requestor,
      });

      return Promise.resolve({});
    });
    getHandler.apply(swatchCtx, [key, requestor]).then(result => {
      expect(result).to.equal(undefined);
      expect(calculatedBehavior.get.called).to.equal(true);

      done();
    }).catch(done);
  });
});
