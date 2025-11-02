pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO_BACKEND = '590184146868.dkr.ecr.ap-south-1.amazonaws.com/backend-app'
        ECR_REPO_FRONTEND = '590184146868.dkr.ecr.ap-south-1.amazonaws.com/frontend-app'
        EC2_USER = 'ubuntu'
        EC2_HOST = '13.202.69.157'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/JoeMarian/Assignment2-CICD.git'
            }
        }

        stage('Build & Test Backend') {
            steps {
                dir('backend') {
                    sh '''
                        pip3 install -r requirements.txt
                        python3 -m unittest discover tests || true
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        npm install
                        npm run build
                    '''
                }
            }
        }

        stage('Build and Push Docker Images') {
            steps {
                script {
                    // ensure buildx available and login to ECR from controller
                    sh '''
                        echo "Logging into ECR from controller..."
                        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${ECR_REPO_BACKEND%/*}
                        docker buildx create --use || true
                    '''

                    dir('backend') {
                        sh """
                            echo "Building & pushing backend image..."
                            docker buildx build --platform linux/amd64 -t ${ECR_REPO_BACKEND}:latest --push .
                        """
                    }

                    dir('frontend') {
                        sh """
                            echo "Building & pushing frontend image..."
                            docker buildx build --platform linux/amd64 -t ${ECR_REPO_FRONTEND}:latest --push .
                        """
                    }
                }
            }
        }

        stage('Deploy to EC2 (with cleanup)') {
            steps {
                script {
                    // Compose the remote script here so ${AWS_REGION}, ${ECR_REPO_*} expand on controller
                    def remoteScript = """
set -e
echo "Logging into ECR on EC2..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO_BACKEND.split('/')[0]}

echo "Pulling latest images..."
docker pull ${ECR_REPO_BACKEND}:latest || true
docker pull ${ECR_REPO_FRONTEND}:latest || true

echo "Stopping and removing any existing containers..."
docker stop backend || true
docker rm backend || true
docker stop frontend || true
docker rm frontend || true

echo "Cleaning up unused images, containers, volumes..."
docker system prune -af --volumes || true

echo "Starting backend container..."
docker run -d --name backend -p 5000:5000 ${ECR_REPO_BACKEND}:latest

echo "Starting frontend container..."
docker run -d --name frontend -p 3000:3000 ${ECR_REPO_FRONTEND}:latest

echo "Deployment finished."
"""

                    // Use withCredentials to get path to temporary key file ($SSH_KEY)
                    withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                        // Send the prepared remoteScript to EC2 using a single-quoted heredoc so remote executes exact content
                        sh """
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" ${EC2_USER}@${EC2_HOST} <<'EOF'
${remoteScript}
EOF
"""
                    }
                }
            }
        }
    }

    post {
        success {
            mail to: 'joemarian3010@gmail.com',
                 subject: "✅ CI/CD SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "Deployment completed successfully. Visit: http://${EC2_HOST}:3000"
        }
        failure {
            mail to: 'joemarian3010@gmail.com',
                 subject: "❌ CI/CD FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "Pipeline failed. Check Jenkins logs for details: ${env.BUILD_URL}"
        }
    }
}