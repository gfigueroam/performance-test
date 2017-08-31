FROM docker.br.hmheng.io/com-hmhco-one-ui/nodebase:9e5e532afafab5e7335b02a491ec2cd3e03565cf
MAINTAINER Brian Timm brian.timm@hmhco.com
LABEL app=docker.br.hmheng.io/com-hmhco-uds/uds

# Create working directory in container
RUN mkdir -p /opt

# Copy all built resources into working directory
ADD app_deploy/ /opt/uds

# Set up working directory to start service
WORKDIR /opt/uds
