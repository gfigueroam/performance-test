async function hasAccessTo(requestor, owner) {
  if (requestor === owner) {
    return Promise.resolve(true);
  }

  // TODO: Implement IDS lookup to determine whether requestor is a teacher of owner.
  // For now, return false.
  return Promise.resolve(false);
}

export default {
  hasAccessTo,
};
