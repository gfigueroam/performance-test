import apiTestStub from '../stub';

describe('Admin Data API', () => {
  apiTestStub('data.admin', 'apps', {
    realm: 'json',
    user: 'data.admin.test.user.1',
  });
  apiTestStub('data.admin', 'users', {
    realm: 'json',
  });
});
