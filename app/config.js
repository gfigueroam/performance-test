import nconf from 'nconf';

import parseArgv from './utils/args';

const env = process.env.NODE_ENV || 'local';

const commonConfig = `${process.cwd()}/config/config.json`;
const envConfig = `${process.cwd()}/config/config.${env}.json`;

nconf.env({ separator: '__' }).argv();
nconf.file('envFile', { file: envConfig });
nconf.file('commonFile', { file: commonConfig });

nconf.set('env', env);

const args = process.argv;

const serverPortParam = parseArgv(args, 'port', 5200);
nconf.set('server_port', serverPortParam.value);


export default nconf;
