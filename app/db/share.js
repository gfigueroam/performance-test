async function query(params) {
  if (!params.id) {
    throw new Error('Parameter "id" is required.');
  }

  // TODOBT - Implement this with DB lookup by share ID
  return {
    authz: 'mock-authz',
    ctx: 'mock-ctx',
    id: params.id,
    key: 'mock-key',
    user: 'mock-user',
  };
}

module.exports = {
  query,
};
