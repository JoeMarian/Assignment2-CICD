pipeline {
    agent any

    tools {
        maven 'Maven3'
    }

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO_BACKEND = '590184146868.dkr.ecr.ap-south-1.amazonaws.com/backend-app'
        ECR_REPO_FRONTEND = '590184146868.dkr.ecr.ap-south-1.amazonaws.com/frontend-app'
        EC2_USER = 'ubuntu'
        EC2_HOST = '13.202.69.157'
        SSH_KEY = credentials('ec2-ssh-key')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/JoeMarian/Assignment2-CICD.git'
            }
        }

        stage('Setup Python Dependencies and Test Backend') {
            steps {
                dir('backend') {
                    sh 'pip3 install -r requirements.txt'
                    sh 'python3 -m unittest discover tests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Build and Push Docker Images (Multi-Arch)') {
            steps {
                script {
                    def backendImage = "${ECR_REPO_BACKEND}:latest"
                    def frontendImage = "${ECR_REPO_FRONTEND}:latest"

                    sh '''
                    # Setup Docker Buildx
                    docker buildx create --use || true
                    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${ECR_REPO_BACKEND%/*}

                    # Build and Push Backend for both ARM and AMD architectures
                    cd backend
                    docker buildx build --platform linux/amd64,linux/arm64 -t $ECR_REPO_BACKEND:latest --push .

                    # Build and Push Frontend
                    cd ../frontend
                    docker buildx build --platform linux/amd64,linux/arm64 -t $ECR_REPO_FRONTEND:latest --push .
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    // Save SSH key securely and use input redirection to avoid interpolation warning
                    writeFile file: 'ec2_key.pem', text: SSH_KEY
                    sh 'chmod 600 ec2_key.pem'

                    sh '''
                    ssh -o StrictHostKeyChecking=no -i ec2_key.pem ${EC2_USER}@${EC2_HOST} '
                        docker login --username AWS -p $(aws ecr get-login-password --region ${AWS_REGION}) ${ECR_REPO_BACKEND%/*}
                        
                        docker pull ${ECR_REPO_BACKEND}:latest
                        docker stop backend || true
                        docker rm backend || true
                        docker run -d --name backend -p 5000:5000 ${ECR_REPO_BACKEND}:latest

                        docker pull ${ECR_REPO_FRONTEND}:latest
                        docker stop frontend || true
                        docker rm frontend || true
                        docker run -d --name frontend -p 3000:3000 ${ECR_REPO_FRONTEND}:latest
                    '
                    '''
                }
            }
        }
    }

    post {
        success {
            mail to: 'joemarian3010@gmail.com',
                subject: "✅ Jenkins Build Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build succeeded!\n\nView details: ${env.BUILD_URL}"
        }
        failure {
            mail to: 'joemarian3010@gmail.com',
                subject: "❌ Jenkins Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build failed.\n\nCheck details: ${env.BUILD_URL}"
        }
    }
}
