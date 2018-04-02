import chai from 'chai';
import sinon from 'sinon';

import constants from '../../../../app/utils/constants';
import middleware from '../../../../app/middleware';

const expect = chai.expect;


const noop = sinon.stub();

function createMockSwatchCtx() {
  return {
    req: {
      headers: {},
    },
  };
}

describe('middleware.database', () => {
  it('should not set useMaster flag in standard requests', async () => {
    const mockCtx = createMockSwatchCtx();
    await middleware.database.ensureReadConsistency(mockCtx, noop);

    expect(mockCtx.database.consistentRead).to.equal(false);
    expect(noop.called).to.equal(true);
  });

  it('should set useMaster flag when header is present', async () => {
    const mockCtx = createMockSwatchCtx();
    mockCtx.req.headers[constants.UDS_CONSISTENT_READ_HEADER] = 1;

    await middleware.database.ensureReadConsistency(mockCtx, noop);

    expect(mockCtx.database.consistentRead).to.equal(true);
    expect(noop.called).to.equal(true);
  });
});
