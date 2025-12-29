pipeline {
  agent any

  environment {
    IMAGE_NAME = "medrec-frontend"
    IMAGE_TAG  = "${BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Dependency Check') {
      steps {
        echo "Running dependency check..."
        sh '''
          npm install
          npm audit --audit-level=high
        '''
      }
    }

    stage('SonarQube Analysis') {
      environment {
        SONAR_TOKEN = credentials('sonar-token')
      }
      steps {
        sh '''
          docker run --rm \
            -v /var/lib/jenkins/workspace/medrec-ci:/usr/src \
            -w /usr/src \
            sonarsource/sonar-scanner-cli \
            sonar-scanner \
              -Dsonar.projectKey=medrec-frontend \
              -Dsonar.sources=medrec-frontend,src \
              -Dsonar.exclusions=**/node_modules/**,**/dist/** \
              -Dsonar.host.url=http://172.17.0.1:9000 \
              -Dsonar.login=$SONAR_TOKEN
        '''
      }
    }

    stage('Docker Build') {
      steps {
        echo "Building Docker image..."
        sh '''
          docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
        '''
      }
    }

  }
}
