import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const app = `uds.bvt.data.app.blob.delete.app.${seed.buildNumber}`;
const password = 'password1234abcd';
const user = 'data.admin.test.user.1';

describe('data.app.blob.delete', () => {
  apiTestStub('data.app', 'blob.delete', { app, password, user });
});
