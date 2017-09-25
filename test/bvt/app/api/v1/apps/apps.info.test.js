import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

const name = `uds.bvt.apps.info.test.${seed.buildNumber}`;

describe('apps.info', () => {
  apiTestStub('apps', 'info', { name });
});
