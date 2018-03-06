import chai from 'chai';
import sinon from 'sinon';

import dynamo from '../../../../../app/db/client/dynamo';
import instrumented from '../../../../../app/db/client/instrumented';

const expect = chai.expect;


describe('db.instrumented', () => {
  const mockGetParams = {
    ConsistentRead: true,
    Key: {
      appUser: 'test-app-user',
      key: 'test-app-key',
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: 'test-table-name',
  };
  const mockPutParams = {
    Item: {
      appKey: 'test-app-key',
      appUser: 'test-app-user',
      data: 'test-data',
      key: 'test-key',
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: 'test-table-name',
  };

  const mockDynamo = {
    get: params => {
      expect(params).to.deep.equal(mockGetParams);
      return {
        promise: () => ({ test: true }),
      };
    },
    put: params => {
      expect(params).to.deep.equal(mockPutParams);
      return {
        promise: () => ({ test: false }),
      };
    },
  };

  it('should wrap dynamo queries with prometheus metrics', async () => {
    sinon.stub(dynamo, 'getClient').returns(mockDynamo);

    const mockGetResult = await instrumented('get', mockGetParams);
    expect(mockGetResult).to.deep.equal({ test: true });

    const mockPutResult = await instrumented('put', mockPutParams);
    expect(mockPutResult).to.deep.equal({ test: false });

    dynamo.getClient.restore();
  });
});
