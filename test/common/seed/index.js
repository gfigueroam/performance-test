import calculatedBehavior from './calculatedBehavior';
import apps from './apps';
import user from './user';

const buildNumber = process.env.BUILD_NUMBER || Math.floor(Math.random() * 1000);

export default {
  apps,
  buildNumber,
  calculatedBehavior,
  user,
};
