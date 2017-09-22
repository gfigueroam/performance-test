import apiTestStub from '../stub';

describe('HMH Data API', () => {
  apiTestStub('data.hmh', 'contentProgression.get', {});
  apiTestStub('data.hmh', 'contentProgression.set', {});
});
