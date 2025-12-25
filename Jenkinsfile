pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Ganti URL git sesuai repo kamu
                git 'https://github.com/jeremylong/DependencyCheck.git' 
            }
        }
        
        stage('Scan Security') {
            steps {
                // PENTING: 'DP-Check-Tool' harus SAMA PERSIS 
                // dengan "Name" yang kamu isi di Langkah 1 tadi.
                dependencyCheck additionalArguments: '--format HTML --format XML', odcInstallation: 'DP-Check-Tool'
            }
        }
    }

    post {
        always {
            // Ini biar reportnya muncul di halaman depan job
            dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
        }
    }
}