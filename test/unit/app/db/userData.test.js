import chai from 'chai';
import sinon from 'sinon';

import appData from '../../../../app/db/appData';
import userData from '../../../../app/db/userData';

import auth from '../../../../app/auth';
import errors from '../../../../app/models/errors';

const expect = chai.expect;

const requestor = 'unittest.userData.user';
const key = 'unittest.userData.key';
const keyPrefix = 'unittest.userData.';
const data = 'some data';
const type = 'text';
const swatchCtx = {
  database: {
    consistentRead: true,
  },
};

let appDataQueryStub;

describe('userData', () => {
  before(() => {
    sinon.stub(appData, 'set').callsFake(params => {
      expect(params).to.deep.equal({
        app: 'hmh',
        data,
        key,
        owner: requestor,
        requestor,
        type,
      });
      return undefined;
    });
    sinon.stub(appData, 'get').callsFake(params => {
      expect(params).to.deep.equal({
        app: 'hmh',
        key,
        owner: requestor,
        requestor,
      });
      return {};
    });
    sinon.stub(appData, 'unset').callsFake(params => {
      expect(params).to.deep.equal({
        app: 'hmh',
        key,
        owner: requestor,
        requestor,
      });
      return undefined;
    });
    sinon.stub(appData, 'list').callsFake(params => {
      expect(params).to.deep.equal({
        app: 'hmh',
        owner: requestor,
        requestor,
      });
      return {
        Items: [],
      };
    });

    appDataQueryStub = sinon.stub(appData, 'query');

    sinon.stub(auth.ids, 'hasAccessTo').returns(true);
  });
  after(() => {
    appDataQueryStub.restore();

    appData.get.restore();
    appData.set.restore();
    appData.unset.restore();
    appData.list.restore();

    auth.ids.hasAccessTo.restore();
  });

  describe('set', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await userData.set.apply(swatchCtx, [{
          data: true,
          key,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await userData.set.apply(swatchCtx, [{
          data: true,
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "data" is not passed in the params', async () => {
      try {
        await userData.set.apply(swatchCtx, [{
          key,
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "type" is not passed in the params', async () => {
      try {
        await userData.set.apply(swatchCtx, [{
          data,
          key,
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls appData.set with "hmh" as the app parameter', (done) => {
      userData.set.apply(swatchCtx, [{
        data,
        key,
        requestor,
        type,
      }])
      .then(done)
      .catch(done);
    });
  });

  describe('unset', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await userData.unset.apply(swatchCtx, [{
          key,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await userData.unset.apply(swatchCtx, [{
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls appData.unset with "hmh" as the app param', (done) => {
      userData.unset.apply(swatchCtx, [{
        key,
        requestor,
      }])
      .then(done)
      .catch(done);
    });
  });

  describe('get', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await userData.get.apply(swatchCtx, [{
          key,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await userData.get.apply(swatchCtx, [{
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls appData.get with "hmh" as the app name', (done) => {
      userData.get.apply(swatchCtx, [{
        key,
        requestor,
      }])
      .then((response) => {
        expect(response).to.deep.equal({});
        done();
      })
      .catch(done);
    });
  });

  describe('query', () => {
    it('throws an error if "keyPrefix" is not passed in the params', async () => {
      try {
        await userData.get.apply(swatchCtx, [{ requestor }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await userData.query.apply(swatchCtx, [{ keyPrefix }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error when requestor does not match owner', async () => {
      auth.ids.hasAccessTo.returns(false);

      try {
        await userData.query.apply(swatchCtx, [{
          keyPrefix,
          owner: 'other-id',
          requestor,
        }]);
        return Promise.reject();
      } catch (err) {
        expect(err).to.equal(errors.codes.ERROR_CODE_AUTH_INVALID);
        return Promise.resolve();
      }
    });

    it('calls appData.get with "hmh" as the app name and no results', (done) => {
      auth.ids.hasAccessTo.returns(true);

      appDataQueryStub.callsFake(params => {
        expect(params).to.deep.equal({
          app: 'hmh',
          keyPrefix,
          owner: requestor,
          requestor,
        });
        return undefined;
      });

      userData.query.apply(swatchCtx, [{
        keyPrefix,
        requestor,
      }])
      .then((response) => {
        expect(response).to.equal(undefined);
        done();
      })
      .catch(done);
    });

    it('calls appData.get with "hmh" as the app name and list of results', (done) => {
      appDataQueryStub.callsFake(params => {
        expect(params).to.deep.equal({
          app: 'hmh',
          keyPrefix,
          owner: requestor,
          requestor,
        });
        return [{
          data: 'mock-data',
          key: 'mock-key',
          type: 'mock-type',
          user: 'mock-user',
        }];
      });

      userData.query.apply(swatchCtx, [{
        keyPrefix,
        requestor,
      }])
      .then((response) => {
        expect(response).to.deep.equal([{
          data: 'mock-data',
          key: 'mock-key',
          type: 'mock-type',
          user: 'mock-user',
        }]);
        done();
      })
      .catch(done);
    });
  });

  describe('list', () => {
    it('throws an error if "requestor" is not passed in the params', async () => {
      try {
        await userData.list.apply(swatchCtx, [{
        }]);
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls appData.list with "hmh" as the app name', (done) => {
      userData.list.apply(swatchCtx, [{
        requestor,
      }])
      .then((response) => {
        expect(response).to.deep.equal({
          Items: [],
        });
        done();
      })
      .catch(done);
    });
  });
});
