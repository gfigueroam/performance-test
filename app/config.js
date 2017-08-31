import nconf from 'nconf';

import parseArgv from './utils/args';

const env = process.env.NODE_ENV || 'local';

const commonConfig = `${process.cwd()}/config/config.json`;
const envConfig = `${process.cwd()}/config/config.${env}.json`;

nconf.env({ separator: '__' }).argv();
nconf.file('envFile', { file: envConfig });
nconf.file('commonFile', { file: commonConfig });

nconf.set('env', env);

const defaultPort = 5200;
const defaultAdminPort = 5201;

const args = process.argv;
const serverPortParam = parseArgv(args, 'port', defaultPort);
const serverAdminPortParam = parseArgv(args, 'admin_port', defaultAdminPort);

nconf.set('server_port', serverPortParam.value);
nconf.set('admin_server_port', serverAdminPortParam.value);


export default nconf;
