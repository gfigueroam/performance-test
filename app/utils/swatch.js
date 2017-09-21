import errors from '../models/errors';
import logger from '../monitoring/logger';

const codes = Object.values(errors.codes);

export default function onException(error) {
  logger.error(`Exception thrown by Swatch handler: ${error}`);

  // Get the error message from the exception
  const code = (error && error.message) || error;

  // Check whether its a known error code thrown by UDS
  //  If so, re-throw the original error and response
  if (codes.includes(code)) {
    throw error;
  }

  // Otherwise we have some kind of unexpected error
  //  Throw a generic message to hide internal errors
  throw errors.codes.ERROR_CODE_INTERNAL_ERROR;
}
