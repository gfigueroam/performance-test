import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

describe('App Data API', () => {
  apiTestStub('data.app', 'blob.get', {
    app: `uds.bvt.data.app.blob.get.app.${seed.buildNumber}`,
    password: 'password1234abcd',
    user: 'data.admin.test.user.1',
  });
  apiTestStub('data.app', 'blob.set', {
    app: `uds.bvt.data.app.blob.set.app.${seed.buildNumber}`,
    data: 'Test blob content',
    password: 'password1234abcd',
    user: 'data.admin.test.user.1',
  });
  apiTestStub('data.app', 'blob.delete', {
    app: `uds.bvt.data.app.blob.delete.app.${seed.buildNumber}`,
    password: 'password1234abcd',
    user: 'data.admin.test.user.1',
  });
  apiTestStub('data.app', 'json.get', {
    app: `uds.bvt.data.app.json.get.app.${seed.buildNumber}`,
    key: `uds.bvt.data.app.json.get.test.${seed.buildNumber}`,
    password: 'password1234abcd',
    user: 'data.admin.test.user.1',
  });
  apiTestStub('data.app', 'json.set', {
    app: `uds.bvt.data.app.json.set.app.${seed.buildNumber}`,
    data: { data: 'true', other_data: 'false' },
    key: `uds.bvt.data.app.json.set.test.${seed.buildNumber}`,
    password: 'password1234abcd',
    user: 'data.admin.test.user.1',
  });
  apiTestStub('data.app', 'json.delete', {
    app: `uds.bvt.data.app.json.delete.app.${seed.buildNumber}`,
    key: `uds.bvt.data.app.json.delete.test.${seed.buildNumber}`,
    password: 'password1234abcd',
    user: 'data.admin.test.user.1',
  });
  apiTestStub('data.app', 'json.list', {
    app: `uds.bvt.data.app.json.list.app.${seed.buildNumber}`,
    password: 'password1234abcd',
    user: 'data.admin.test.user.1',
  });
  apiTestStub('data.app', 'json.merge', {
    app: `uds.bvt.data.app.json.merge.app.${seed.buildNumber}`,
    data: { merge_data: 'true', merge_sample_data: 'false' },
    key: `uds.bvt.data.app.json.merge.test.${seed.buildNumber}`,
    password: 'password1234abcd',
    user: 'data.admin.test.user.1',
  });
});
