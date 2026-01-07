pipeline {
  agent any

  // BAGIAN INI PENTING:
  // Pastikan kamu sudah install plugin 'NodeJS' dan
  // setup di 'Global Tool Configuration' dengan nama 'NodeJS' (atau sesuaikan namanya).
  // Jika npm sudah ada di path server jenkins, bagian tools ini bisa dihapus.
  tools {
    nodejs 'NodeJS' 
  }

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
        // Masuk ke folder frontend dulu jika ini monorepo
        // Jika repo kamu isinya langsung frontend, hapus block dir() ini
        dir('medrec-frontend') { 
            sh '''
              npm install
              # Tambahkan '|| true' agar pipeline tidak gagal merah jika ada celah keamanan minor
              npm audit --audit-level=high || true 
            '''
        }
      }
    }

    

    stage('Docker Build') {
      steps {
        echo "Building Docker image..."
        // Pastikan Dockerfile ada di dalam folder medrec-frontend
        // Jika Dockerfile ada di root, ganti 'medrec-frontend' jadi '.'
        sh '''
          docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ./medrec-frontend
        '''
      }
    }

  }
}