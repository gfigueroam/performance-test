import chai from 'chai';

import constants from '../../../../app/utils/constants';
import middleware from '../../../../app/middleware';

import runner from '../../../common/helpers/runner';

const expect = chai.expect;

function createMockCtx() {
  return {
    request: {
      headers: {},
    },
    swatchCtx: {},
  };
}

const dbFn = middleware.database.ensureReadConsistency;

describe('Database Middleware', () => {
  it('should not set useMaster flag in standard requests', done => {
    const mockCtx = createMockCtx();
    runner.asyncRunMiddleware(dbFn, mockCtx, () => {
      expect(mockCtx.swatchCtx.database.consistentRead).to.equal(false);
      done();
    });
  });

  it('should set useMaster flag when header is present', done => {
    const mockCtx = createMockCtx();
    mockCtx.request.headers[constants.UDS_CONSISTENT_READ_HEADER] = 1;

    runner.asyncRunMiddleware(dbFn, mockCtx, () => {
      expect(mockCtx.swatchCtx.database.consistentRead).to.equal(true);
      done();
    });
  });
});
