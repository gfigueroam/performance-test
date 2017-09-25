/* eslint-disable sort-keys */
import parsers from '../../parsers';

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
        parse: parsers.strings.parseString,
      },
      {
        name: 'url',
        optional: false,
        parse: parsers.strings.parseString,
      },
    ],
  },
  'authz.info': {
    handler: infoHandler,
    args: [
      {
        name: 'name',
        optional: false,
        parse: parsers.strings.parseString,
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
        parse: parsers.strings.parseString,
      },
    ],
  },
};
/* eslint-enable sort-keys */
