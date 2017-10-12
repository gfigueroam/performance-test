import errors from '../../models/errors';

function validateTextData(param) {
  // Make sure the data string is non-empty
  if (param.length === 0) {
    throw errors.codes.ERROR_CODE_INVALID_DATA;
  }
}

export default {
  validateTextData,
};
