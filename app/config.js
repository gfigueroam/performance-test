import nconf from 'nconf';

import parseArgv from './utils/args';

const env = process.env.NODE_ENV || 'local';

const commonConfig = `${process.cwd()}/config/config.json`;
const envConfig = `${process.cwd()}/config/config.${env}.json`;

nconf.env({ separator: '__' }).argv();
nconf.file('envFile', { file: envConfig });
nconf.file('commonFile', { file: commonConfig });

// Database configuration
nconf.file('databaseBaseFile', {
  file: `${process.cwd()}/database/config/db.json`,
});
nconf.file('databaseEnvFile', {
  file: `${process.cwd()}/database/config/db.${env}.json`,
});

nconf.set('env', env);

const args = process.argv;

const serverPortParam = parseArgv(args, 'port', 5200);
nconf.set('server_port', serverPortParam.value);

const externalEndpoint = nconf.get('uds:url:external');
if (externalEndpoint) {
  nconf.set('uds:url:primary', externalEndpoint);
} else {
  const internalEndpoint = nconf.get('uds:url:internal');
  nconf.set('uds:url:primary', internalEndpoint);
}


export default nconf;
