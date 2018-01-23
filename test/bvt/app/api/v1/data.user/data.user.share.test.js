import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const key = `uds.bvt.data.user.share.test.${seed.buildNumber}`;
const authz = 'authz12id';
const ctx = 'authz.test.ctx.1';
const requestor = 'data.admin.test.requestor.1';

describe('data.user.share', () => {
  apiTestStub('data.user', 'share', { authz, ctx, key, requestor });
});
