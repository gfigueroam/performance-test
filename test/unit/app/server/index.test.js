import chai from 'chai';
import sinon from 'sinon';

import http from 'http';

import metrics from '../../../../app/metrics';
import server from '../../../../app/server';

const expect = chai.expect;


describe('server', () => {
  const koaStub = {
    callback: sinon.stub(),
    use: sinon.stub(),
  };
  const serverStub = {
    listen: sinon.stub(),
    on: sinon.stub(),
  };

  before(() => {
    sinon.stub(metrics.gauges, 'initialize');
    sinon.stub(http, 'createServer').returns(serverStub);
  });

  after(() => {
    metrics.gauges.initialize.restore();
    http.createServer.restore();
  });

  it('should start a server with correct env', () => {
    koaStub.use.onCall(0).callsFake(metricsMiddleware => {
      expect(typeof metricsMiddleware).to.equal('function');
    });
    koaStub.use.onCall(1).callsFake(compress => {
      expect(typeof compress).to.equal('function');
    });
    koaStub.use.onCall(2).callsFake(logger => {
      expect(typeof logger).to.equal('function');
    });
    koaStub.use.onCall(3).callsFake(reqIdLogger => {
      expect(typeof reqIdLogger).to.equal('function');
    });
    koaStub.use.onCall(4).callsFake(reqLogger => {
      expect(typeof reqLogger).to.equal('function');
    });
    koaStub.use.onCall(5).callsFake(parser => {
      expect(typeof parser).to.equal('function');
    });
    koaStub.use.onCall(6).callsFake(docsRoute => {
      expect(typeof docsRoute).to.equal('function');
    });
    koaStub.use.onCall(7).callsFake(swagger => {
      expect(typeof swagger).to.equal('function');
    });

    serverStub.listen.callsFake((port, done) => {
      expect(port).to.equal(5200);
      done();
    });
    serverStub.on.callsFake((evt, fn) => {
      expect(evt).to.equal('error');
      expect(typeof fn).to.equal('function');
    });

    server.start(koaStub);

    expect(metrics.gauges.initialize.called).to.equal(true);
  });
});
