import appData from './appData';

const HMH_APP = 'hmh';

async function get(params) {
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }

  params.app = HMH_APP;
  return appData.getJson(params);
}

async function set(params) {
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.type) {
    throw new Error('Parameter "type" is required.');
  }
  if (params.data === undefined) {
    throw new Error('Parameter "data" is required.');
  }
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }

  params.app = HMH_APP;
  return appData.setJson(params);
}

async function unset(params) {
  if (!params.key) {
    throw new Error('Parameter "key" is required.');
  }
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }

  params.app = HMH_APP;
  return appData.unsetJson(params);
}

async function list(params) {
  if (!params.user) {
    throw new Error('Parameter "user" is required.');
  }

  params.app = HMH_APP;
  return appData.listJson(params);
}

module.exports = {
  get,
  list,
  set,
  unset,
};
