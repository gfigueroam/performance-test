import chai from 'chai';

import config from '../../../../app/config';

const expect = chai.expect;

const endpoint = config.get('uds:url:internal');

describe('cors', () => {
  describe('OPTIONS', () => {
    it('should return proper headers', done => {
      chai.request(endpoint)
        .options('/api/v1/data.app.query')
        .set('Access-Control-Request-Headers', 'authorization,content-type')
        .set('Access-Control-Request-Method', 'POST')
        .set('Origin', 'http://int.hmhone.app.hmhco.com')
        .end((error, res) => {
          expect(res).to.have.status(204);
          expect(res.headers['access-control-allow-methods']).to.equal('GET,HEAD,PUT,POST,DELETE,PATCH');
          expect(res.headers['access-control-allow-origin']).to.be.a('string');
          done(error);
        });
    });
  });
});
