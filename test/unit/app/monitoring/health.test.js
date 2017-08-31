import chai from 'chai';

import healthHandler from '../../../../app/monitoring/health';

const expect = chai.expect;

describe('health', () => {
  it('always sets context status to 200', (done) => {
    const ctx = {};
    healthHandler(ctx)
    .then(() => {
      expect(ctx.status).to.equal(200);
      expect(ctx.body).to.equal('OK');
      done();
    });
  });
});
