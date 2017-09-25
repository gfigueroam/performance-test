import apiTestStub from '../stub';

const realm = 'json';

describe('data.admin.users', () => {
  apiTestStub('data.admin', 'users', { realm });
});
