import chai from 'chai';

const expect = chai.expect;

describe('metrics', () => {
  describe('GET', () => {
    it('should return process metrics', done => {
      chai.request(process.env.ENDPOINT)
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
