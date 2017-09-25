import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const name = `uds.bvt.apps.setPerUserQuota.test.${seed.buildNumber}`;
const quota = 2048;

describe('apps.setPerUserQuota', () => {
  apiTestStub('apps', 'setPerUserQuota', { name, quota });
});
