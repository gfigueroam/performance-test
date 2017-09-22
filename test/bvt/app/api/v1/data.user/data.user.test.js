import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

describe('User Data API', () => {
  apiTestStub('data.user', 'get', {
    key: `uds.bvt.data.user.get.test.${seed.buildNumber}`,
    user: 'data.admin.test.user.1',
  });
  apiTestStub('data.user', 'set', {
    data: 'Test text content',
    key: `uds.bvt.data.user.set.test.${seed.buildNumber}`,
    type: 'text',
    user: 'data.admin.test.user.1',
  });
  apiTestStub('data.user', 'delete', {
    key: `uds.bvt.data.user.delete.test.${seed.buildNumber}`,
    user: 'data.admin.test.user.1',
  });
  apiTestStub('data.user', 'list', {
    user: 'data.admin.test.user.1',
  });
  apiTestStub('data.user', 'getShared', {
    id: `uds.bvt.data.user.getShared.test.${seed.buildNumber}`,
  });
  apiTestStub('data.user', 'share', {
    authz: 'authz.test.id.1',
    ctx: 'authz.test.ctx.1',
    key: `uds.bvt.data.user.share.test.${seed.buildNumber}`,
    user: 'data.admin.test.user.1',
  });
  apiTestStub('data.user', 'unshare', {
    id: `uds.bvt.data.user.unshare.test.${seed.buildNumber}`,
    user: 'data.admin.test.user.1',
  });
});
