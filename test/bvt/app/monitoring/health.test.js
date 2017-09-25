import chai from 'chai';

const expect = chai.expect;

describe('health', () => {
  describe('GET', () => {
    it('should return health check status', done => {
      chai.request(process.env.ENDPOINT)
        .get('health')
        .end((error, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal('OK');
          done(error);
        });
    });
  });
});
