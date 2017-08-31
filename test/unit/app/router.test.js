import chai from 'chai';

import swatchRoutes from '../../../app/router';

const expect = chai.expect;

describe('All Routes', () => {
  it('should have expected number of routes declared', () => {
    expect(swatchRoutes.length).to.equal(1);

    expect(swatchRoutes[0].options.prefix).to.equal('');
    expect(swatchRoutes[0].routes.length).to.equal(1);
  });
});
