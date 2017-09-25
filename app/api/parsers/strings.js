// This parser is used for required string params, and
//  will coerce a missing argument into the empty string
function parseString(param) {
  if (param === null || param === undefined) {
    return '';
  }
  return String(param).trim();
}

// This parser is used for optional string params, where
//  the handler cares about an undefined/missing argument
function parseOptionalString(param) {
  if (param === null || param === undefined) {
    return undefined;
  }
  return parseString(param);
}

export default {
  parseOptionalString,
  parseString,
};
