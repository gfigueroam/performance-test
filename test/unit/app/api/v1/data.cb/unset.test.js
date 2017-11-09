import chai from 'chai';
import sinon from 'sinon';

import calculatedBehavior from '../../../../../../app/db/calculatedBehavior';

import unsetHandler from '../../../../../../app/api/v1/data.cb/unset';

const expect = chai.expect;

const key = 'test.data.user.set.name';
const user = 'hmh-test-user.123';

describe('data.cb.unset', () => {
  after(() => {
    calculatedBehavior.unset.restore();
  });

  it('returns no value', done => {
    sinon.stub(calculatedBehavior, 'unset').callsFake((params) => {
      expect(params).to.deep.equal({
        key,
        user,
      });
    });
    unsetHandler(key, user).then(result => {
      expect(result).to.equal(undefined);
      expect(calculatedBehavior.unset.called).to.equal(true);
      done();
    }).catch(done);
  });
});
