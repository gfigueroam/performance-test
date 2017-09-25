import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const app = `uds.bvt.data.app.json.list.app.${seed.buildNumber}`;
const password = 'password1234abcd';
const user = 'data.admin.test.user.1';

describe('data.app.json.list', () => {
  apiTestStub('data.app', 'json.list', { app, password, user });
});
