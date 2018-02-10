import chai from 'chai';

import constants from '../../../../app/utils/constants';
import middleware from '../../../../app/middleware';

import runner from '../../../common/helpers/runner';

const expect = chai.expect;

function createMockSwatchCtx() {
  return {
    req: {
      headers: {},
    },
  };
}

const dbFn = middleware.database.ensureReadConsistency;

describe('Database Middleware', () => {
  it('should not set useMaster flag in standard requests', done => {
    const mockCtx = createMockSwatchCtx();
    runner.asyncRunMiddleware(dbFn, mockCtx, () => {
      expect(mockCtx.database.consistentRead).to.equal(false);
      done();
    });
  });

  it('should set useMaster flag when header is present', done => {
    const mockCtx = createMockSwatchCtx();
    mockCtx.req.headers[constants.UDS_CONSISTENT_READ_HEADER] = 1;

    runner.asyncRunMiddleware(dbFn, mockCtx, () => {
      expect(mockCtx.database.consistentRead).to.equal(true);
      done();
    });
  });
});
