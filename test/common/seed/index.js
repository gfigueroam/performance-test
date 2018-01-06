import calculatedBehavior from './calculatedBehavior';
import apps from './apps';
import user from './user';
import app from './app';
import authz from './authz';

const buildNumber = process.env.BUILD_NUMBER || Math.floor(Math.random() * 1000);

export default {
  app,
  apps,
  authz,
  buildNumber,
  calculatedBehavior,
  user,
};
