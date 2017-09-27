import apiTestStub from '../stub';

const realm = 'hmh';

describe('data.admin.users', () => {
  apiTestStub('data.admin', 'users', { realm });
});
