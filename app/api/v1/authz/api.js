/* eslint-disable sort-keys */
import infoHandler from './info';
import listHandler from './list';
import registerHandler from './register';
import removeHandler from './remove';

export default {
  'authz.register': {
    handler: registerHandler,
    args: [
      {
        name: 'name',
        optional: false,
      },
      {
        name: 'url',
        optional: false,
      },
    ],
  },
  'authz.info': {
    handler: infoHandler,
    args: [
      {
        name: 'name',
        optional: false,
      },
    ],
  },
  'authz.list': {
    handler: listHandler,
  },
  'authz.remove': {
    handler: removeHandler,
    args: [
      {
        name: 'name',
        optional: false,
      },
    ],
  },
};
/* eslint-enable sort-keys */
