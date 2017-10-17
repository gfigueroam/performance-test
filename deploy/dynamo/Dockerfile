FROM docker.br.hmheng.io/base-ubuntu:java_1.8.0_74-b02
MAINTAINER Brian Timm brian.timm@hmhco.com
LABEL app=docker.br.hmheng.io/com-hmhco-uds/dynamodb

# Create working subdirectory in container
RUN mkdir -p /opt
RUN mkdir -p /opt/dynamodb
RUN mkdir -p /opt/dynamodb/data
RUN mkdir -p /opt/dynamodb/workdir

# Set up working directory for DynamoDB service
WORKDIR /opt/dynamodb/workdir

# Expose port for local DynamoDB
EXPOSE 5201

RUN wget -O /opt/dynamodb/installer https://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz && \
    tar xfz /opt/dynamodb/installer && \
    rm -f /opt/dynamodb/installer

ENTRYPOINT ["/usr/bin/java", "-Djava.library.path=.", "-jar", "DynamoDBLocal.jar", "-dbPath", "/opt/dynamodb/data"]
CMD ["-port", "5201"]
