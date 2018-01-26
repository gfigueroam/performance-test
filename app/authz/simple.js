import errors from '../models/errors';

// Built-in authz functions that always allow/always deny access
//  Use for testing and for any access patterns with simple behavior
function allow() { }

function deny() {
  throw errors.codes.ERROR_CODE_AUTHZ_ACCESS_DENIED;
}

module.exports = {
  allow,
  deny,
};
