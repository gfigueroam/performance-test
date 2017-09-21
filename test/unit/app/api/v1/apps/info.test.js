import chai from 'chai';

import infoHandler from '../../../../../../app/api/v1/apps/info';

const expect = chai.expect;

const name = 'test.apps.info.name';

describe('apps.info', () => {
  it('returns an empty stub value', done => {
    infoHandler(name).then(result => {
      expect(result).to.deep.equal({});
      done();
    }).catch(done);
  });
});
