/* eslint-disable sort-keys */
import getContentProgression from './contentProgression.get';
import setContentProgression from './contentProgression.set';

export default {
  'data.hmh.contentProgression.get': {
    handler: getContentProgression,
  },
  'data.hmh.contentProgression.set': {
    handler: setContentProgression,
  },
};
/* eslint-enable sort-keys */
