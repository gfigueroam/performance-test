import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const app = `uds.bvt.data.app.json.delete.app.${seed.buildNumber}`;
const key = `uds.bvt.data.app.json.delete.test.${seed.buildNumber}`;
const password = 'password1234abcd';
const user = 'data.admin.test.user.1';

describe('data.app.json.delete', () => {
  apiTestStub('data.app', 'json.delete', { app, key, password, user });
});
