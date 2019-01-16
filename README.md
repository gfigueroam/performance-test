User-Centric Data Service (UDS)

# Operations

* [Kibana production logs](https://kibana.br.hmheng.io/app/kibana#/discover/AWF8j2WRMmY0_W5X0fH3)

* [Grafana metrics dashboard](http://grafana.prod.hmheng-infra.brnp.internal/dashboard/db/uds)

* [Production Jenkins pipeline](http://jenkins.prod.hmheng-uds.brnp.internal/job/uds/)

* [#UDS on Slack](https://hmhco.slack.com/messages/C6MP6P7NE)

# Development Information

## Database
UDS uses DynamoDB as its data store. See [the DB design documentation](./docs/design/db.md) for more details.

## Coding Style

This project follows the [AirBnB Javascript Coding Guidelines](https://github.com/airbnb/javascript) using [ESLint](http://eslint.org/) settings.

## Local DynamoDB
1. Install the awsclient command line tool.
2. Run Local DynamoDB in Docker: `$ docker run -p 5201:5201 -d -v dynamodb_data:/opt/dynamodb/data -v dynamodb_workdir:/opt/dynamodb/workdir docker.br.hmheng.io/com-hmhco-uds/dynamodb` (If for some reason a DynamoDB image has not been built, you can build one yourself by running `$ ./deploy/dynamo/docker.sh`. You'll need to be on the Bedrock VPN.)
3. Create necessary tables by running `$ npm run db:create:local`. (In dev, int, cert, and prod environments this is already done by TerraForm.)
4. Verify the tables were created:  `$ aws dynamodb list-tables --region us-east-1 --endpoint-url http://localhost:5201`. (Note that the `region` specified in the command must match the region in the database configuration.)

To scan the items stored in the DynamoDB table: `$ aws dynamodb scan --table-name uds-local-calculated-behavior --region us-east-1 --endpoint-url http://localhost:5201`

### Convenience Scripts

* List All Tables `$ npm run db:list:local`
* Delete Tables `$ npm run db:delete:local`
* Create Tables `$ npm run db:create:local`
* Scan Tables (List Contents) `$ npm run db:scan:local`

### Commandline Access
Query for a single app:
```
$ aws dynamodb get-item --endpoint http://localhost:5201 --region us-east-1 --table-name uds-local-apps --key '{"name": {"S": "APP2"}}'
```

Note: If you get errors relating to the _key_ param json value you may need to escape the double quotes.

## Running UDS in Docker Containers
Initially you will need to run all these steps. Unless you change the code, subsequent runs can be done by running steps 3 & 4 only.
1. Build the App
```$ npm run build:app```

2. Create the deploy folder
```$ npm run docker:local```

3. Build and run the uds and dynamo docker containers
```$ docker-compose up -d```
4. To stop running and remove the containers
```$ docker-compose down```

Alternatively if you need to run steps 1 -3 use
```$ npm run run:local```


## Initializing the docker dynamoDB tables
The tables only need to be created the first time you run via docker, or if you delete the volumes.   

1. To create the dynamoDb tables for docker, the simpliest way is to bash into the Uds container as follows
```$ docker exec -it <uds container id> bash```
2. Next run the following script   
```$ npm run db:create:docker```

When inside the uds container you can run any of the convenience scripts (from the Local Dynamo DB section listed above), just replace _local_ with _docker_.    
  
**Note:** dynamoDb is using the same mounts as the command line above for the local configuration. However when the tables are created in dynamoDb the value of the environment name (NODE_ENV) is used to make up the table name. So the tables used in each environment are actually a different set of tables. eg.   
* uds-local-apps   
* uds-docker-apps

## Commandline Access
To run commands directly against the docker dynamoDb instance from outside of the UDS container (aws cli is not installed in the uds container), exit the conatiner and run the command as per the "Commandline Access" from the Local Dynamo DB section, but replace _local_ in the table name with _docker_. Or for a simple test here is a command to list all tables.
```
aws dynamodb list-tables --endpoint http://localhost:5201
```
You should get a list of uds docker tables.
``` 
{
    "TableNames": [
        "uds-docker-app-data-json",
        "uds-docker-apps",
        "uds-docker-authz",
        "uds-docker-calculated-behavior",
        "uds-docker-share"
    ]
}
```

### Troubleshooting

If after running the list-tables command you dont see the docker tables as expected and you have already created them using the steps above then you may need to change you AWS credentials or beter still switch your AWS profile. 

When running against a local version of aws dynamoDb it will use your credentials username + region to form a scope. 

So in the dynamoDb container the scope that is targeted is defined by the credentials used, which can be found in the 2 files _database\config\db.json_ and _database\config\db.docker.json_. So for the dynamoDb docker container the scope is _fakeAccessKey_us-east-1.db_

If you want to target this same scope (from you local pc, ie outside any container) and access the uds docker tables, you must set the same credentials before running the "Commandline Access" or list-tables examples above. You can do this by running 
```
$ aws configure
```
Enter the details as per the db.docker.json & db.json
```
AWS Access Key ID: fakeAccessKey
AWS Secret Access Key: fakeSecretAccessKey
Default Region Name: us-east-1
```

OR if you have previously been using the aws cli and you already have credentials set, then it may be preferable to create a new aws profile.

From your home folder open the file .aws/credentials
Add the following 
```
[udsDocker]
aws_access_key_id = fakeAccessKey
aws_secret_access_key = fakeSecretAccessKey
region = us-east-1
```

From your home folder open .aws/config
Add the following 
```
[udsDocker]
region = us-east-1
```

Now set the aws environment profile variable
```
AWS_PROFILE="udsDocker"
```

Running the list-tables aws cli command should now return the uds docker tables.

## Telegraf

UDS instances running in Bedrock include [Telegraf](https://www.influxdata.com/time-series-platform/telegraf/)
to scrape Prometheus metrics and push them to HMH shared InfluxDB. Telegraf service does not need to run locally,
but is spun up in the Aurora configuration and run embedded in each UDS instance, tagging metrics in InfluxDB
with links to each separate Mesos instance/shard. The latest UDS metrics dashboard is available on
[Grafana](http://grafana.prod.hmheng-infra.brnp.internal/dashboard/db/uds).

## SonarQube

The code analysis stage of the CI process leverages a tool called SonarQube to scan for code smells, bugs, or vulnerabilities. The SonarQube project is hosted [https://sonarqubehmh.prod.hmheng-qe.br.internal/dashboard?id=io.hmheng.uds](https://sonarqubehmh.prod.hmheng-qe.br.internal/dashboard?id=io.hmheng.uds). Each time a push is made to the GitHub project that is not on the `master` branch the code will be run against SonarQube and must past the quality gates set within that project. The plugin [SonarQube Scanner for Jenkins](http://redirect.sonarsource.com/plugins/jenkins.html) is required.

