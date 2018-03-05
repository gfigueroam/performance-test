import chai from 'chai';
import sinon from 'sinon';

import server from '../../../app/server';


describe('app', () => {
  it('should start the UDS server', () => {
    sinon.stub(server, 'start').callsFake(app => {
      chai.expect(typeof app).to.equal('object');
    });

    // eslint-disable-next-line global-require
    require('../../../app');

    server.start.restore();
  });
});
