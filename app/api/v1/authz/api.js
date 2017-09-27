/* eslint-disable sort-keys */
import parsers from '../../parsers';
import validators from '../../validators';

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
        validate: validators.strings.validateName,
      },
      {
        name: 'url',
        optional: false,
        parse: parsers.strings.parseString,
        validate: validators.strings.validateURL,
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
        validate: validators.strings.validateName,
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
        validate: validators.strings.validateName,
      },
    ],
  },
};
/* eslint-enable sort-keys */
