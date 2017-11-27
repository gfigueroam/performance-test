import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const app = `uds.bvt.data.app.blob.delete.app.${seed.buildNumber}`;
const user = 'data.admin.test.user.1';

describe('data.app.blob.delete', () => {
  apiTestStub('data.app', 'blob.delete', { app, user });
});
