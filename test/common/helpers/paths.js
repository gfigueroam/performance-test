import common from 'hmh-bfm-nodejs-common';


const udsPaths = {
  APPS_INFO: 'api/v1/apps.info',
  APPS_LIST: 'api/v1/apps.list',
  APPS_REGISTER: 'api/v1/apps.register',
  APPS_REMOVE: 'api/v1/apps.remove',
  APPS_REMOVE_PER_USER_QUOTA: 'api/v1/apps.removePerUserQuota',
  APPS_SET_PER_USER_QUOTA: 'api/v1/apps.setPerUserQuota',

  AUTHZ_INFO: 'api/v1/authz.info',
  AUTHZ_LIST: 'api/v1/authz.list',
  AUTHZ_REGISTER: 'api/v1/authz.register',
  AUTHZ_REMOVE: 'api/v1/authz.remove',

  DATA_ADMIN_APPS: 'api/v1/data.admin.apps',

  DATA_APP_DELETE: 'api/v1/data.app.delete',
  DATA_APP_GET: 'api/v1/data.app.get',
  DATA_APP_LIST: 'api/v1/data.app.list',
  DATA_APP_MERGE: 'api/v1/data.app.merge',
  DATA_APP_QUERY: 'api/v1/data.app.query',
  DATA_APP_SET: 'api/v1/data.app.set',

  DATA_CB_DECREMENT: 'api/v1/data.cb.decrement',
  DATA_CB_GET: 'api/v1/data.cb.get',
  DATA_CB_INCREMENT: 'api/v1/data.cb.increment',
  DATA_CB_MERGE: 'api/v1/data.cb.merge',
  DATA_CB_QUERY: 'api/v1/data.cb.query',
  DATA_CB_SET: 'api/v1/data.cb.set',
  DATA_CB_UNSET: 'api/v1/data.cb.unset',

  DATA_USER_DELETE: 'api/v1/data.user.delete',
  DATA_USER_GET: 'api/v1/data.user.get',
  DATA_USER_GET_SHARED: 'api/v1/data.user.getShared',
  DATA_USER_LIST: 'api/v1/data.user.list',
  DATA_USER_QUERY: 'api/v1/data.user.query',
  DATA_USER_SET: 'api/v1/data.user.set',
  DATA_USER_SHARE: 'api/v1/data.user.share',
  DATA_USER_UNSHARE: 'api/v1/data.user.unshare',
};

const commonPaths = common.test.paths;

const paths = Object.assign(
  {},
  udsPaths,
  commonPaths,
);

export default paths;
