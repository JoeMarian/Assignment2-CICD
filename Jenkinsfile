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

        stage('Build and Push Docker Images') {
            steps {
                script {
                    def backendImage = "${env.ECR_REPO_BACKEND}:latest"
                    def frontendImage = "${env.ECR_REPO_FRONTEND}:latest"

                    sh '''
                        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${ECR_REPO_BACKEND%/*}
                        docker buildx create --use || true

                        echo "Building and pushing backend image..."
                        cd backend
                        docker buildx build --platform linux/amd64 -t ${ECR_REPO_BACKEND}:latest --push .

                        echo "Building and pushing frontend image..."
                        cd ../frontend
                        docker buildx build --platform linux/amd64 -t ${ECR_REPO_FRONTEND}:latest --push .
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh '''
                        echo "Connecting to EC2 and deploying containers..."

                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            echo "Logging into ECR..."
                            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO_BACKEND%/*}

                            echo "Deploying backend..."
                            docker pull ${ECR_REPO_BACKEND}:latest
                            docker stop backend || true
                            docker rm backend || true
                            docker run -d --name backend -p 5000:5000 ${ECR_REPO_BACKEND}:latest

                            echo "Deploying frontend..."
                            docker pull ${ECR_REPO_FRONTEND}:latest
                            docker stop frontend || true
                            docker rm frontend || true
                            docker run -d --name frontend -p 3000:3000 ${ECR_REPO_FRONTEND}:latest

                            echo "Deployment completed successfully."
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
                 body: """Good news! The pipeline completed successfully.

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
URL: ${env.BUILD_URL}
"""
        }
        failure {
            mail to: 'joemarian3010@gmail.com',
                 subject: "❌ Jenkins Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: """Unfortunately, the pipeline failed.

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
URL: ${env.BUILD_URL}
"""
        }
    }
}
