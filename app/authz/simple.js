import errors from '../models/errors';

// Built-in authz functions that always allow/always deny access
//  Use for testing and for any access patterns with simple behavior
function allow() { }

function deny() {
  throw errors.codes.ERROR_CODE_AUTHZ_ACCESS_DENIED;
}

// Export the built-in authz modes and function handlers
const simpleAuthzModes = {
  uds_authz_allow: allow,
  uds_authz_deny: deny,
};

export default simpleAuthzModes;
