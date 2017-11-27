import chai from 'chai';

import swatchRoutes from '../../../app/router';

const expect = chai.expect;

describe('All Routes', () => {
  it('should have expected number of routes declared', () => {
    expect(swatchRoutes.length).to.equal(3);

    expect(swatchRoutes[0].options.prefix).to.equal('api/v1');
    expect(swatchRoutes[1].options.prefix).to.equal('uds/api/v1');
    expect(swatchRoutes[2].options.prefix).to.equal('');

    expect(swatchRoutes[0].routes.length).to.equal(33);
    expect(swatchRoutes[1].routes.length).to.equal(33);
    expect(swatchRoutes[2].routes.length).to.equal(1);
  });
});
