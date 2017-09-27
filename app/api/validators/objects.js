import errors from '../../models/errors';

function validateTextData(param) {
  // Make sure the data string is non-empty
  if (param.length === 0) {
    throw errors.codes.ERROR_CODE_INVALID_DATA;
  }
}

function validateJsonData(param) {
  // JSON data object must be a non-empty dict
  if (Object.keys(param).length === 0) {
    throw errors.codes.ERROR_CODE_INVALID_DATA;
  }
}

export default {
  validateJsonData,
  validateTextData,
};
