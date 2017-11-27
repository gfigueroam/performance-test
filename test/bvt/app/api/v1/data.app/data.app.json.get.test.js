import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const app = `uds.bvt.data.app.json.get.app.${seed.buildNumber}`;
const key = `uds.bvt.data.app.json.get.test.${seed.buildNumber}`;
const user = 'data.admin.test.user.1';

describe('data.app.json.get', () => {
  apiTestStub('data.app', 'json.get', { app, key, user });
});
