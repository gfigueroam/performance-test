import AWS from 'aws-sdk';
import chai from 'chai';
import sinon from 'sinon';

// We can import appData before we set the DocumentClient stub
// because appData uses lazy initialization. See details within
// appData.js
import appData from '../../../../app/db/appData';
import quota from '../../../../app/db/quota';
import apps from '../../../../app/db/apps';
import dynamoDBClient from '../../../../app/db/dynamoDBClient';
import nconf from '../../../../app/config';
import constants from '../../../../app/utils/constants';
import errors from '../../../../app/models/errors';

const expect = chai.expect;

const documentClientStub = sinon.createStubInstance(AWS.DynamoDB.DocumentClient);

const user = 'unittest.userData.user';
const key = 'unittest.userData.key';
const app = 'unittestapp';
const data = 'unit test data';

describe('appData', () => {
  before(() => {
    sinon.stub(dynamoDBClient, 'instrumented').callsFake((method, params) => (
      documentClientStub[method](params).promise()
    ));
    sinon.stub(apps, 'info');
    sinon.stub(quota, 'getConsumedQuota').returns(10);
  });

  after(() => {
    dynamoDBClient.instrumented.restore();
    apps.info.restore();
    quota.getConsumedQuota.restore();
  });

  describe('getApps', () => {
    after(() => {
      documentClientStub.query.reset();
    });

    it('throws an error if "user" is not passed in the params', async () => {
      try {
        await appData.getApps({});
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('queries the global secondary index', async () => {
      documentClientStub.query.callsFake(params => {
        expect(params.KeyConditionExpression).to.equal('#user = :user');
        expect(params.ProjectionExpression).to.equal('appKey');
        expect(params.IndexName).to.equal('uds-app-data-json-gsi');
        expect(params).to.have.all.keys('ExpressionAttributeNames',
          'KeyConditionExpression',
          'ExpressionAttributeValues',
          'IndexName',
          'ProjectionExpression',
          'TableName',
        );
        return {
          promise: () => (Promise.resolve({
            Items: [{
              appKey: `a${constants.DELIMITER}some-key`,
            }, {
              appKey: `b${constants.DELIMITER}some.other.key`,
            }],
          })),
        };
      });

      const userApps = await appData.getApps({
        user,
      });
      expect(userApps).to.deep.equal(['a', 'b']);
    });

    it('paginates if LastEvaluatedKey is returned', async () => {
      documentClientStub.query.reset(); // Clear any prior call history.
      documentClientStub.query.onCall(0).returns({
        promise: () => (Promise.resolve({
          Items: [{
            appKey: `a${constants.DELIMITER}some-key`,
          }, {
            appKey: `b${constants.DELIMITER}some.other.key`,
          }],
          LastEvaluatedKey: 'someExclusiveStartKey',
        })),
      });
      documentClientStub.query.onCall(1).returns({
        promise: () => (Promise.resolve({
          Items: [{
            appKey: `c${constants.DELIMITER}some-key`,
          }, {
            appKey: `d${constants.DELIMITER}some.other.key`,
          }],
          LastEvaluatedKey: 'someExclusiveStartKey2',
        })),
      });
      documentClientStub.query.onCall(2).returns({
        promise: () => (Promise.resolve({
          Items: [{
            appKey: `e${constants.DELIMITER}some-key`,
          }, {
            appKey: `f${constants.DELIMITER}some.other.key`,
          }],
        })),
      });
      documentClientStub.query.throws(new Error('Did not expect another call to query.'));

      const userApps = await appData.getApps({
        user,
      });
      expect(userApps).to.deep.equal(['a', 'b', 'c', 'd', 'e', 'f']);
    });

    it('removes the HMH_APP from the results', async () => {
      documentClientStub.query.reset(); // Remove the onCall(x) from previous test
      documentClientStub.query.onCall(0).returns({
        promise: () => (Promise.resolve({
          Items: [{
            appKey: `a${constants.DELIMITER}some-key`,
          }, {
            appKey: `b${constants.DELIMITER}some.other.key`,
          }, {
            appKey: `${constants.HMH_APP}${constants.DELIMITER}some.other.key`,
          }, {
            appKey: `d${constants.DELIMITER}some.other.key`,
          }],
        })),
      });
      const userApps = await appData.getApps({
        user,
      });
      expect(userApps).to.deep.equal(['a', 'b', 'd']);
    });
  });

  describe('set', () => {
    after(() => {
      documentClientStub.query.reset();
    });
    it('throws an error if "user" is not passed in the params', async () => {
      try {
        await appData.set({
          app,
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
        await appData.set({
          app,
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
        await appData.set({
          app,
          key,
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "app" is not passed in the params', async () => {
      try {
        await appData.set({
          data,
          key,
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls dynamoDB.set and returns a promisified version', (done) => {
      documentClientStub.put.callsFake(params => {
        expect(params.Item).to.deep.equal({
          appKey: `${app}${constants.DELIMITER}${key}`,
          appUser: `${app}${constants.DELIMITER}${user}`,
          data,
          key,
          type: undefined,
          user,
        });

        expect(params).to.have.all.keys('Item', 'TableName');
        return {
          promise: () => (Promise.resolve()),
        };
      });

      apps.info.callsFake(params => {
        expect(params.name).to.equal(app);
        return Promise.resolve({
          quota: 1024,
        });
      });

      appData.set({
        app,
        data,
        key,
        user,
      })
      .then(done)
      .catch(done);
    });

    it('throws a quota exceeded error if existing quota is exceeded', (done) => {
      quota.getConsumedQuota.returns(1025);

      apps.info.callsFake(params => {
        expect(params.name).to.equal(app);
        return Promise.resolve({
          quota: 1024,
        });
      });

      appData.set({
        app,
        data,
        key,
        user,
      })
      .then(() => {
        quota.getConsumedQuota.reset();
        done('Expected an error!');
      })
      .catch((err) => {
        delete err.detail;
        expect(err.message).to.equal(errors.codes.ERROR_CODE_QUOTA_EXCEEDED);
        quota.getConsumedQuota.reset();
        done();
      });
    });
  });

  describe('merge', () => {
    it('throws an error if "user" is not passed in the params', async () => {
      try {
        await appData.merge({
          app,
          data: {
            b: true,
          },
          key,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await appData.merge({
          app,
          data: {
            b: true,
          },
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "data" is not passed in the params', async () => {
      try {
        await appData.merge({
          app,
          key,
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "app" is not passed in the params', async () => {
      try {
        await appData.set({
          data,
          key,
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls dynamoDB.update if there is an existing value already stored', (done) => {
      documentClientStub.update.callsFake(params => {
        expect(params).to.deep.equal({
          ConditionExpression: 'attribute_exists(#data) AND #data = :oldval',
          ExpressionAttributeNames: {
            '#data': 'data',
          },
          ExpressionAttributeValues: {
            ':oldval': {
              existingKey: 'existingValue',
            },
            ':value': {
              existingKey: 'existingValue',
              newKey: 'newValue',
            },
          },
          Key: {
            appUser: `${app}${constants.DELIMITER}${user}`,
            key,
          },
          TableName: nconf.get('database').appDataJsonTableName,
          UpdateExpression: 'SET #data = :value',
        });

        return {
          promise: () => (Promise.resolve()),
        };
      });

      documentClientStub.get.callsFake(params => {
        expect(params.Key).to.deep.equal({
          appUser: `${app}${constants.DELIMITER}${user}`,
          key,
        });
        expect(params).to.have.all.keys('Key', 'TableName');

        return {
          promise: () => (Promise.resolve({
            Item: {
              data: {
                existingKey: 'existingValue',
              },
            },
          })),
        };
      });

      apps.info.callsFake(params => {
        expect(params.name).to.equal(app);
        return Promise.resolve({
          quota: 1024,
        });
      });

      appData.merge({
        app,
        data: {
          newKey: 'newValue',
        },
        key,
        user,
      })
      .then((result) => {
        expect(result).to.deep.equal({
          existingKey: 'existingValue',
          newKey: 'newValue',
        });
        done();
      })
      .catch(done);
    });

    it('calls dynamoDB.put if there is not an existing value', (done) => {
      documentClientStub.put.callsFake(params => {
        expect(params).to.deep.equal({
          ConditionExpression: 'attribute_not_exists(#data)',
          ExpressionAttributeNames: {
            '#data': 'data',
          },
          Item: {
            appKey: `${app}${constants.DELIMITER}${key}`,
            appUser: `${app}${constants.DELIMITER}${user}`,
            data: {
              newKey: 'newValue',
            },
            key,
            type: undefined,
            user,
          },
          TableName: nconf.get('database').appDataJsonTableName,
        });

        return {
          promise: () => (Promise.resolve()),
        };
      });

      documentClientStub.get.callsFake(params => {
        expect(params.Key).to.deep.equal({
          appUser: `${app}${constants.DELIMITER}${user}`,
          key,
        });
        expect(params).to.have.all.keys('Key', 'TableName');

        return {
          promise: () => (Promise.resolve({
            Item: undefined,
          })),
        };
      });

      apps.info.callsFake(params => {
        expect(params.name).to.equal(app);
        return Promise.resolve({
          quota: 1024,
        });
      });

      appData.merge({
        app,
        data: {
          newKey: 'newValue',
        },
        key,
        user,
      })
      .then((result) => {
        expect(result).to.deep.equal({
          newKey: 'newValue',
        });
        done();
      })
      .catch(done);
    });


    it('throws an error if quota is exceeded', (done) => {
      quota.getConsumedQuota.returns(1025);

      apps.info.callsFake(params => {
        expect(params.name).to.equal(app);
        return Promise.resolve({
          quota: 1024,
        });
      });

      appData.merge({
        app,
        data: {
          newKey: 'newValue',
        },
        key,
        user,
      })
      .then(() => {
        quota.getConsumedQuota.reset();
        done('Expected an error!');
      })
      .catch((err) => {
        delete err.detail;
        expect(err.message).to.equal(errors.codes.ERROR_CODE_QUOTA_EXCEEDED);
        quota.getConsumedQuota.reset();
        done();
      });
    });
  });

  describe('unset', () => {
    it('throws an error if "user" is not passed in the params', async () => {
      try {
        await appData.unset({
          app,
          key,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await appData.unset({
          app,
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "app" is not passed in the params', async () => {
      try {
        await appData.unset({
          key,
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls dynamoDB.delete and returns a promisified version', (done) => {
      documentClientStub.delete.callsFake(params => {
        expect(params.Key).to.deep.equal({
          appUser: `${app}${constants.DELIMITER}${user}`,
          key,
        });
        expect(params).to.have.all.keys('Key', 'TableName');
        return {
          promise: () => (Promise.resolve()),
        };
      });
      apps.info.callsFake(params => {
        expect(params.name).to.equal(app);
        return Promise.resolve({
          quota: 1024,
        });
      });
      // Provide a fake item when queried, since otherwise the
      // method should throw a key not found error
      documentClientStub.get.callsFake(params => {
        expect(params.Key).to.deep.equal({
          appUser: `${app}${constants.DELIMITER}${user}`,
          key,
        });
        expect(params).to.have.all.keys('Key', 'TableName');
        return {
          promise: () => (Promise.resolve({
            Item: {},
          })),
        };
      });
      appData.unset({
        app,
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
        await appData.get({
          app,
          key,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "key" is not passed in the params', async () => {
      try {
        await appData.get({
          app,
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "app" is not passed in the params', async () => {
      try {
        await appData.get({
          key,
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls dynamoDB.get and returns a promisified version', (done) => {
      documentClientStub.get.callsFake(params => {
        expect(params.Key).to.deep.equal({
          appUser: `${app}${constants.DELIMITER}${user}`,
          key,
        });
        expect(params).to.have.all.keys('Key', 'TableName');
        return {
          promise: () => (Promise.resolve()),
        };
      });
      appData.get({
        app,
        key,
        user,
      })
      .then(done)
      .catch(done);
    });
  });

  describe('list', () => {
    it('throws an error if "user" is not passed in the params', async () => {
      try {
        await appData.list({
          app,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('throws an error if "app" is not passed in the params', async () => {
      try {
        await appData.list({
          user,
        });
        return Promise.reject();
      } catch (err) {
        return Promise.resolve();
      }
    });

    it('calls dynamoDB.query and returns a promisified version', (done) => {
      documentClientStub.query.callsFake(params => {
        expect(params.KeyConditionExpression).to.equal('appUser = :appUser');
        expect(params).to.have.all.keys('ExpressionAttributeNames',
          'KeyConditionExpression',
          'ExpressionAttributeValues',
          'ProjectionExpression',
          'TableName',
        );
        return {
          promise: () => (Promise.resolve()),
        };
      });
      appData.list({
        app,
        user,
      })
      .then(done)
      .catch(done);
    });
  });
});
