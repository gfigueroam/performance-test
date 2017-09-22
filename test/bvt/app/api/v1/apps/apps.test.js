import apiTestStub from '../stub';

import seed from '../../../../../common/seed';

describe('Apps API', () => {
  apiTestStub('apps', 'register', {
    name: `uds.bvt.apps.register.test.${seed.buildNumber}`,
    password: 'password1234abcd',
    quota: 1024,
  });
  apiTestStub('apps', 'info', {
    name: `uds.bvt.apps.info.test.${seed.buildNumber}`,
  });
  apiTestStub('apps', 'list', {});
  apiTestStub('apps', 'passwords.add', {
    name: `uds.bvt.apps.passwords.add.test.${seed.buildNumber}`,
    password: 'password1234abcd',
  });
  apiTestStub('apps', 'passwords.remove', {
    name: `uds.bvt.apps.passwords.remove.test.${seed.buildNumber}`,
    passwordId: 'password.test.id.12345',
  });
  apiTestStub('apps', 'remove', {
    name: `uds.bvt.apps.remove.test.${seed.buildNumber}`,
  });
  apiTestStub('apps', 'setPerUserQuota', {
    name: `uds.bvt.apps.setPerUserQuota.test.${seed.buildNumber}`,
    quota: 2048,
  });
});
