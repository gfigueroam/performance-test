#!/bin/bash

# Script to build Docker image containing local DynamoDB service
#  Only need to run once, then push the reusable image to HMH artifactory

echo Building DynamoDB Dockerfile
docker build . -f deploy/dynamo/Dockerfile -t docker.br.hmheng.io/com-hmhco-uds/dynamodb
