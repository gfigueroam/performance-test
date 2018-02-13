import chai from 'chai';

import config from '../../../../app/config';

const expect = chai.expect;

const endpoint = config.get('uds:url:internal');

describe('swagger', () => {
  describe('GET', () => {
    it('should return swagger API JSON', done => {
      chai.request(endpoint)
        .get('swagger/api-docs.json')
        .end((error, res) => {
          expect(res).to.have.status(200);
          done(error);
        });
    });
  });
});
