import chai from 'chai';
import sinon from 'sinon';
import appData from '../../../../app/db/appData';
import userData from '../../../../app/db/userData';

const expect = chai.expect;

const requestor = 'unittest.userData.user';
const key = 'unittest.userData.key';
const data = 'some data';
const type = 'text';
const swatchCtx = {
  database: {
    consistentRead: true,
  },
};

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
  });
  after(() => {
    appData.get.restore();
    appData.set.restore();
    appData.unset.restore();
    appData.list.restore();
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
        owner: requestor,
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
