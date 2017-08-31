import chai from 'chai';

import parseArgv from '../../../../app/utils/args';

const expect = chai.expect;

describe('Args Utilities', () => {
  describe('parseArgv', () => {
    const args = [
      '/usr/local/bin/node',
      '/uds/app/index.js',
      'run',
      'port=1234',
      'admin_port=7890',
      'env=test',
    ];

    it('should parse a valid command line argument', () => {
      const portArg = parseArgv(args, 'port', 1000);
      expect(portArg.arg_passed).to.equal(true);
      expect(portArg.value).to.equal('1234');

      const adminPortArg = parseArgv(args, 'admin_port', 2000);
      expect(adminPortArg.arg_passed).to.equal(true);
      expect(adminPortArg.value).to.equal('7890');

      const envArg = parseArgv(args, 'env', 'dev');
      expect(envArg.arg_passed).to.equal(true);
      expect(envArg.value).to.equal('test');
    });

    it('should return a default value for a missing argument', () => {
      const otherArg = parseArgv(args, 'missing', 'not found');
      expect(otherArg.arg_passed).to.equal(false);
      expect(otherArg.value).to.equal('not found');
    });
  });
});
