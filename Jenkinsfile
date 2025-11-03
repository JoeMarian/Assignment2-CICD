pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO_BACKEND = '590184146868.dkr.ecr.ap-south-1.amazonaws.com/backend-app'
        EC2_USER = 'ubuntu'
        EC2_HOST = '13.202.69.157'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/JoeMarian/Assignment2-CICD.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                script {
                    sh '''
                        echo "Logging into AWS ECR..."
                        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${ECR_REPO_BACKEND%/*}

                        echo "Building and pushing backend image..."
                        cd backend
                        docker buildx create --use || true
                        docker buildx build --platform linux/amd64 -t ${ECR_REPO_BACKEND}:latest --push .
                    '''
                }
            }
        }

        stage('Deploy Backend on EC2') {
            steps {
                script {
                    def remoteScript = """
set -e
echo "Logging into ECR on EC2..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO_BACKEND.split('/')[0]}

echo "Pulling latest backend image..."
docker pull ${ECR_REPO_BACKEND}:latest || true

echo "Stopping old container..."
docker stop backend || true
docker rm backend || true

echo "Cleaning unused images and containers..."
docker system prune -af --volumes || true

echo "Starting new backend container..."
docker run -d --name backend -p 5000:5000 ${ECR_REPO_BACKEND}:latest

echo "Deployment complete! Accessible at http://${EC2_HOST}:5000/"
"""

                    withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
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
                 subject: "✅ SUCCESS: Backend Deployed (#${env.BUILD_NUMBER})",
                 body: "Backend deployed successfully. Visit http://${EC2_HOST}:5000/"
        }
        failure {
            mail to: 'joemarian3010@gmail.com',
                 subject: "❌ FAILURE: Deployment Failed (#${env.BUILD_NUMBER})",
                 body: "Deployment failed. Check Jenkins logs: ${env.BUILD_URL}"
        }
    }
}