import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const key = `uds.bvt.data.user.share.test.${seed.buildNumber}`;
const authz = 'authz.test.id.1';
const ctx = 'authz.test.ctx.1';
const user = 'data.admin.test.user.1';

describe('data.user.share', () => {
  apiTestStub('data.user', 'share', { authz, ctx, key, user });
});
