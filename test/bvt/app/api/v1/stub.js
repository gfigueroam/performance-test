// Temporary stub to test all stubbed API endpoints
//  Remove file after actual handlers/tests are implemented
import chai from 'chai';

const expect = chai.expect;

export default async function apiTestStub(objectName, methodName, params) {
  describe(methodName, () => {
    it('should be a stub', (done) => {
      chai.request(process.env.ENDPOINT)
        .post(`api/v1/${objectName}.${methodName}`)
        .set('Content-Type', 'application/json')
        .send(params)
        .end((err, res) => {
          expect(err).to.equal(null);
          expect(res).to.have.status(200);
          expect(res.body.ok).to.equal(true);
          done(err);
        });
    });
  });
}
