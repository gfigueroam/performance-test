#!/bin/bash

# Script to build Docker image containing all packaged files

echo Building Dockerfile
docker build . -t docker.br.hmheng.io/com-hmhco-uds/uds
