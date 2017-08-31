def app_name = "uds"
def docker_folder = "com-hmhco-uds"

// UDS service is built on Node and requiring at least version 6.3.0
// Jenkins needs a base HMH Node container to build and test UDS service
//  Docker-in-Docker causes permission issues for the host user inside the container
//  Use volumes to give container access to user info and permissions to home directory
def node_version = "6.3.0"
def dind_image_name = "docker.br.hmheng.io/dind-nodejs-git:${node_version}"
def dind_cmd_line_params = "--privileged -v /etc/passwd:/etc/passwd -v /home/ec2-user:/home/ec2-user"

def dockerfile_filename = "Dockerfile"

// GUID for 'hmheng-ci' Credentials configured on Jenkins instance (devel + prod)
def ssh_agent_git_credentials = "66427afc-2571-4f67-b135-c9a4e6b50ca2"


def git_commit
def docker_tag
def jenkins_env
def sem_version
def package_version
def generated_docker_image_name

node {
  try {
    stage("Checkout") {
      checkout scm
      sh "git log -1"

      git_commit = find_git_commit()
      echo "Git Commit -> $git_commit"

      package_version = find_package_version()
      echo "Package Version -> $package_version"

      sem_version = "$package_version-${env.BUILD_NUMBER}"
      echo "Semantic Version -> $sem_version"

      docker_tag = "$sem_version-$git_commit"
      echo "Docker Tag -> $docker_tag"

      generated_docker_image_name = "docker.br.hmheng.io/com-hmhco-uds/uds:$docker_tag"
      echo "Generated Docker Image Name -> $generated_docker_image_name"

      // Jenkins builds are parameterized with Jenkins env (devel/prod)
      jenkins_env = env.JENKINS_ENV
      if (jenkins_env == null) {
        jenkins_env = "devel"
      }
      echo "Jenkins Environment -> $jenkins_env"

      // Capture the version information for Jenkins build identifier
      currentBuild.displayName = "$sem_version"

      // Publish a message to Slack channel that build pipeline is starting
      def start_message = "Starting deploy of UDS version: $docker_tag"
      publish_status_message(start_message, "good", jenkins_env)
    }

    docker.image(dind_image_name).inside(dind_cmd_line_params) {
      stage("Build + Test") {
        sshagent([ssh_agent_git_credentials]) {
          sh "npm run build:app"
        }
        sh "npm test"
      }
    }

    stage("Build Docker Image") {
      if (jenkins_env.equalsIgnoreCase("prod")) {
        echo "Building Docker container in Jenkins production and pushing to HMH Artifactory"
        sh "builder build -p $docker_folder/$app_name $docker_tag -f $dockerfile_filename"
      } else {
        echo "Building Docker container locally in non-production Jenkins environment: $jenkins_env"
        sh "builder build $docker_folder/$app_name $docker_tag -f $dockerfile_filename"
      }
    }

    stage("Launch BVT Docker Containers") {
      sh "docker ps"
      sh "docker stop uds-$git_commit || true"
      sh "docker rm uds-$git_commit || true"
      sh "docker run --name uds-$git_commit -e NODE_ENV=docker -d $generated_docker_image_name npm start"
      sh "docker ps"
      sh "sleep 20" // Give UDS a moment to start up before executing
      sh "docker logs uds-$git_commit"
      docker.image(generated_docker_image_name).inside("--link uds-$git_commit:uds $dind_cmd_line_params") {
        stage("Run BVT: docker") {
          sh "npm run bvt:docker"
        }
      }
      sh "docker logs uds-$git_commit"
    }

    if (jenkins_env.equalsIgnoreCase("prod")) {
      deploy_container(app_name, docker_tag, "dev")
      run_bvt("dev", dind_image_name, dind_cmd_line_params)

      deploy_container(app_name, docker_tag, "int")
      run_bvt("int", dind_image_name, dind_cmd_line_params)

      deploy_container(app_name, docker_tag, "cert")
      run_bvt("cert", dind_image_name, dind_cmd_line_params)

      deploy_container(app_name, docker_tag, "prod")
      run_bvt("prod", dind_image_name, dind_cmd_line_params)
    } else {
      echo "Skipping deploy and BVT stages in non-production Jenkins environment: $jenkins_env"
    }

    stop_docker_containers(git_commit)

    def result_message = "Successfully deployed UDS version: $docker_tag"
    publish_status_message(result_message, "good", jenkins_env)
  } catch (error) {
    currentBuild.result = "FAILURE"

    def failure_message = "Error deploying UDS version: $docker_tag"
    publish_status_message(failure_message, "danger", jenkins_env)

    stop_docker_containers(git_commit)

    // After sending Slack message, throw the error to fail the build
    throw error
  }
}

def stop_docker_containers(String git_commit) {
  // Stop Docker containers
  sh "docker stop uds-$git_commit || true"
  sh "docker rm uds-$git_commit || true"
}

def find_git_commit() {
  sh "git rev-parse HEAD > commit"
  return readFile("commit").trim()
}

def find_package_version() {
  sh "cat package.json | grep version | head -1 | awk -F: '{ print \$2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]' > package_version"
  return readFile("package_version").trim()
}

def deploy_container(String app, String tag, String deploy_env) {
  // Deploy UDS container with latest 'tag' to target 'deploy_env'
  stage("Deploy Environment: $deploy_env") {
    def role = "hmheng-uds"
    def aurora_filename = "deploy/bedrock/aurora/app.aurora"
    def ssh_agent_deploy_credentials = "e2382aa2-471e-43c1-aff3-579304d7aa09"

    sshagent([ssh_agent_deploy_credentials]) {
      sh "builder deploy -f $aurora_filename $role $app $tag $deploy_env"
    }
  }
}

def run_bvt(String deploy_env, String image_name, String docker_params) {
  // Launch containing docker image and run suite of BVTs for given environment
  docker.image(image_name).inside(docker_params) {
    stage("Run BVT: $deploy_env") {
      sh "npm run bvt:$deploy_env"
    }
  }
}

def publish_status_message(String status_message, String status_color, String build_env) {
  // Send status 'message' content to Slack with good/warning/danger 'color'
  if (build_env.equalsIgnoreCase("prod")) {
    slackSend color: status_color, message: status_message
  } else {
    echo "Skipping Slack message in non-production Jenkins environment: $build_env"
  }
}
