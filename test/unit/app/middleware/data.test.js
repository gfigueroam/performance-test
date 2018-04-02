import chai from 'chai';
import sinon from 'sinon';

import errors from '../../../../app/models/errors';
import middleware from '../../../../app/middleware';

const expect = chai.expect;


const noop = sinon.stub();

function createMockSwatchCtx() {
  return {
    params: {},
  };
}

describe('middleware.data', () => {
  afterEach(() => { noop.reset(); });

  it('should throw an error if type param is missing', async () => {
    try {
      const mockCtx = createMockSwatchCtx();
      await middleware.data.validateUserDataType(mockCtx, noop);
    } catch (error) {
      expect(error).to.equal(errors.codes.ERROR_CODE_INVALID_DATA_TYPE);
    }
    expect(noop.called).to.equal(false);
  });

  it('should throw an error if type param is not known', async () => {
    try {
      const mockCtx = createMockSwatchCtx();
      mockCtx.params.type = 'unknown';
      await middleware.data.validateUserDataType(mockCtx, noop);
    } catch (error) {
      expect(error).to.equal(errors.codes.ERROR_CODE_INVALID_DATA_TYPE);
    }
    expect(noop.called).to.equal(false);
  });

  it('should throw an error if data object does not match text type', async () => {
    try {
      const mockCtx = createMockSwatchCtx();
      mockCtx.params.type = 'text';
      mockCtx.params.data = { key: 'something' };
      await middleware.data.validateUserDataType(mockCtx, noop);
    } catch (error) {
      expect(error).to.equal(errors.codes.ERROR_CODE_INVALID_DATA);
    }
    expect(noop.called).to.equal(false);
  });

  it('should throw an error if data number does not match text type', async () => {
    try {
      const mockCtx = createMockSwatchCtx();
      mockCtx.params.data = 100;
      mockCtx.params.type = 'text';
      await middleware.data.validateUserDataType(mockCtx, noop);
    } catch (error) {
      expect(error).to.equal(errors.codes.ERROR_CODE_INVALID_DATA);
    }
    expect(noop.called).to.equal(false);
  });

  it('should allow a valid text data value', async () => {
    const mockCtx = createMockSwatchCtx();
    mockCtx.params.data = '100';
    mockCtx.params.type = 'text';

    await middleware.data.validateUserDataType(mockCtx, noop);

    expect(mockCtx.params.data).to.equal('100');
    expect(noop.called).to.equal(true);
  });
});
