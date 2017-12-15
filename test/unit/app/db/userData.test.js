import chai from 'chai';
import sinon from 'sinon';
import appData from '../../../../app/db/appData';
import userData from '../../../../app/db/userData';

const expect = chai.expect;

const user = 'unittest.userData.user';
const key = 'unittest.userData.key';
const data = 'some data';
const type = 'text';

describe('userData', () => {
  before(() => {
    sinon.stub(appData, 'setJson').callsFake(params => {
      expect(params).to.deep.equal({
        app: 'hmh',
        data,
        key,
        type,
        user,
      });
      return undefined;
    });
    sinon.stub(appData, 'getJson').callsFake(params => {
      expect(params).to.deep.equal({
        app: 'hmh',
        key,
        user,
      });
      return {};
    });
    sinon.stub(appData, 'unsetJson').callsFake(params => {
      expect(params).to.deep.equal({
        app: 'hmh',
        key,
        user,
      });
      return undefined;
    });
    sinon.stub(appData, 'listJson').callsFake(params => {
      expect(params).to.deep.equal({
        app: 'hmh',
        user,
      });
      return {
        Items: [],
      };
    });
  });
  after(() => {
    appData.getJson.restore();
    appData.setJson.restore();
    appData.unsetJson.restore();
    appData.listJson.restore();
  });

  describe('set', () => {
    it('throws an error if "user" is not passed in the params', async () => {
      try {
        await userData.set({
          data: true,
          key,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await userData.set({
          data: true,
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "data" is not passed in the params', async () => {
      try {
        await userData.set({
          key,
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "type" is not passed in the params', async () => {
      try {
        await userData.set({
          data,
          key,
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls appData.set with "hmh" as the app parameter', (done) => {
      userData.set({
        data,
        key,
        type,
        user,
      })
      .then(done)
      .catch(done);
    });
  });

  describe('unset', () => {
    it('throws an error if "user" is not passed in the params', async () => {
      try {
        await userData.unset({
          key,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await userData.unset({
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls appData.unset with "hmh" as the app param', (done) => {
      userData.unset({
        key,
        user,
      })
      .then(done)
      .catch(done);
    });
  });

  describe('get', () => {
    it('throws an error if "user" is not passed in the params', async () => {
      try {
        await userData.get({
          key,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await userData.get({
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls appData.get with "hmh" as the app name', (done) => {
      userData.get({
        key,
        user,
      })
      .then((response) => {
        expect(response).to.deep.equal({});
        done();
      })
      .catch(done);
    });
  });

  describe('list', () => {
    it('throws an error if "user" is not passed in the params', async () => {
      try {
        await userData.list({
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls appData.listJson with "hmh" as the app name', (done) => {
      userData.list({
        user,
      })
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
