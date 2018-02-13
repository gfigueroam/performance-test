import chai from 'chai';

import config from '../../../../app/config';

const expect = chai.expect;

const endpoint = config.get('uds:url:internal');

describe('health', () => {
  describe('GET', () => {
    it('should return health check status', done => {
      chai.request(endpoint)
        .get('health')
        .end((error, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal('OK');
          done(error);
        });
    });
  });
});
