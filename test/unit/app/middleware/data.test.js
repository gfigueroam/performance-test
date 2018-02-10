import chai from 'chai';

import errors from '../../../../app/models/errors';
import middleware from '../../../../app/middleware';

import runner from '../../../common/helpers/runner';

const expect = chai.expect;

const noop = () => {};

function createMockSwatchCtx() {
  return {
    params: {},
  };
}

describe('Data Validation Middleware', () => {
  it('should throw an error if type param is missing', done => {
    const mockCtx = createMockSwatchCtx();
    middleware.data.validateUserDataType(mockCtx, noop).catch(error => {
      expect(error).to.equal(errors.codes.ERROR_CODE_INVALID_DATA_TYPE);
      done();
    });
  });

  it('should throw an error if type param is not known', done => {
    const mockCtx = createMockSwatchCtx();
    mockCtx.params.type = 'unknown';
    middleware.data.validateUserDataType(mockCtx, noop).catch(error => {
      expect(error).to.equal(errors.codes.ERROR_CODE_INVALID_DATA_TYPE);
      done();
    });
  });

  it('should throw an error if data object does not match text type', done => {
    const mockCtx = createMockSwatchCtx();
    mockCtx.params.type = 'text';
    mockCtx.params.data = { key: 'something' };
    middleware.data.validateUserDataType(mockCtx, noop).catch(error => {
      expect(error).to.equal(errors.codes.ERROR_CODE_INVALID_DATA);
      done();
    });
  });

  it('should throw an error if data number does not match text type', done => {
    const mockCtx = createMockSwatchCtx();
    mockCtx.params.data = 100;
    mockCtx.params.type = 'text';
    middleware.data.validateUserDataType(mockCtx, noop).catch(error => {
      expect(error).to.equal(errors.codes.ERROR_CODE_INVALID_DATA);
      done();
    });
  });

  it('should allow a valid text data value', done => {
    const mockCtx = createMockSwatchCtx();
    mockCtx.params.data = '100';
    mockCtx.params.type = 'text';

    runner.asyncRunMiddleware(middleware.data.validateUserDataType, mockCtx, () => {
      expect(mockCtx.params.data).to.equal('100');
      done();
    });
  });
});
