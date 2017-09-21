/* eslint-disable sort-keys */
import infoHandler from './info';
import listHandler from './list';
import passwordsAddHandler from './passwords.add';
import passwordsRemoveHandler from './passwords.remove';
import registerHandler from './register';
import removeHandler from './remove';
import setPerUserQuotaHandler from './setPerUserQuota';

export default {
  'apps.register': {
    handler: registerHandler,
    args: [
      {
        name: 'name',
        optional: false,
      },
      {
        name: 'password',
      },
      {
        name: 'quota',
        optional: false,
      },
    ],
  },
  'apps.info': {
    handler: infoHandler,
    args: [
      {
        name: 'name',
        optional: false,
      },
    ],
  },
  'apps.list': {
    handler: listHandler,
  },
  'apps.remove': {
    handler: removeHandler,
    args: [
      {
        name: 'name',
        optional: false,
      },
    ],
  },
  'apps.passwords.add': {
    handler: passwordsAddHandler,
    args: [
      {
        name: 'name',
        optional: false,
      },
      {
        name: 'password',
        optional: false,
      },
    ],
  },
  'apps.passwords.remove': {
    handler: passwordsRemoveHandler,
    args: [
      {
        name: 'name',
        optional: false,
      },
      {
        name: 'passwordId',
        optional: false,
      },
    ],
  },
  'apps.setPerUserQuota': {
    handler: setPerUserQuotaHandler,
    args: [
      {
        name: 'name',
        optional: false,
      },
      {
        name: 'quota',
        optional: false,
      },
    ],
  },
};
/* eslint-enable sort-keys */
