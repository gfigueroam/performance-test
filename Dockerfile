FROM docker.br.hmheng.io/com-hmhco-csl/docker-node:10.15.1
LABEL team "Bifrost Team bifrost-team@hmhco.com"
LABEL app "docker.br.hmheng.io/com-hmhco-uds/uds"

# Update and install latest telegraf package
RUN wget https://dl.influxdata.com/telegraf/releases/telegraf_1.4.4-1_amd64.deb
RUN dpkg -i telegraf_1.4.4-1_amd64.deb

# Create working directory in container for UDS
RUN mkdir -p /opt

# Copy all UDS resources into working directory
ADD app_deploy/ /opt/uds

# Set up working directory to start UDS service
WORKDIR /opt/uds
