import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const app = `uds.bvt.data.app.blob.set.app.${seed.buildNumber}`;
const data = 'Test blob content';
const user = 'data.admin.test.user.1';

describe('data.app.blob.set', () => {
  apiTestStub('data.app', 'blob.set', { app, data, user });
});
