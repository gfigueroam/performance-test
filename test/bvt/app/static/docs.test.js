import chai from 'chai';

import config from '../../../../app/config';

const expect = chai.expect;

const endpoint = config.get('uds:url:internal');

describe('docs', () => {
  describe('GET', () => {
    it('should return an API docs landing page', done => {
      chai.request(endpoint)
        .get('docs/index.html')
        .end((error, res) => {
          expect(res).to.have.status(200);
          done(error);
        });
    });
  });
});
