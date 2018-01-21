import chai from 'chai';

import share from '../../../../app/db/share';

const expect = chai.expect;

describe('share', () => {
  describe('set', () => {
    it('throws an error when id param is missing', async () => {
      try {
        await share.query({ name: 'whatever' });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('returns a mock object when querying by share id', async () => {
      try {
        const result = await share.query({ id: 'whatever' });
        expect(result).to.deep.equal({
          authz: 'mock-authz',
          ctx: 'mock-ctx',
          id: 'whatever',
          key: 'mock-key',
          user: 'mock-user',
        });
        return Promise.resolve();
      } catch (err) {
        return Promise.reject();
      }
    });
  });
});
