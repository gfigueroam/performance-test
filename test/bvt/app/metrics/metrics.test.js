import chai from 'chai';

import config from '../../../../app/config';

const expect = chai.expect;

const endpoint = config.get('uds:url:internal');

describe('metrics', () => {
  describe('GET', () => {
    it('should return process metrics', done => {
      chai.request(endpoint)
        .get('prometheus')
        .end((error, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.include('http_request_count');
          expect(res.text).to.include('http_request_duration_seconds');
          expect(res.text).to.include('process_cpu_usage_percent');
          expect(res.text).to.include('process_memory_usage_bytes');
          done(error);
        });
    });
  });
});
