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
                    sh '''
                        python3 -m venv venv
                        . venv/bin/activate
                        pip install --upgrade pip
                        pip install -r requirements.txt
                        python3 -m unittest discover tests
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

        stage('Build Docker Images') {
            steps {
                script {
                    def backendImage = "${env.ECR_REPO_BACKEND}:latest"
                    def frontendImage = "${env.ECR_REPO_FRONTEND}:latest"

                    echo "Building Docker images..."
                    sh """
                        docker build -t ${backendImage} ./backend
                        docker build -t ${frontendImage} ./frontend
                    """
                }
            }
        }

        stage('Push Images to ECR') {
            steps {
                script {
                    echo "Pushing Docker images to ECR..."
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO_BACKEND%/*}

                        docker push ${ECR_REPO_BACKEND}:latest
                        docker push ${ECR_REPO_FRONTEND}:latest
                    """
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key',
                                                   keyFileVariable: 'SSH_KEY',
                                                   usernameVariable: 'SSH_USER')]) {
                    script {
                        echo "Deploying to EC2 at ${EC2_HOST}..."
                        sh """
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $SSH_USER@${EC2_HOST} << 'EOF'
                        set -e
                        echo "🔐 Logging in to AWS ECR..."
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO_BACKEND%/*}

                        echo "⬇️ Pulling backend image..."
                        docker pull ${ECR_REPO_BACKEND}:latest
                        docker stop backend || true
                        docker rm backend || true
                        docker run -d --name backend -p 5000:5000 ${ECR_REPO_BACKEND}:latest

                        echo "⬇️ Pulling frontend image..."
                        docker pull ${ECR_REPO_FRONTEND}:latest
                        docker stop frontend || true
                        docker rm frontend || true
                        docker run -d --name frontend -p 3000:3000 ${ECR_REPO_FRONTEND}:latest

                        echo "✅ Deployment completed successfully!"
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
                 subject: "✅ Jenkins Build Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: """Good news! The build was successful.

Project: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Details: ${env.BUILD_URL}

Backend: ${env.ECR_REPO_BACKEND}
Frontend: ${env.ECR_REPO_FRONTEND}

-- Jenkins CI/CD Bot
"""
        }

        failure {
            mail to: 'joemarian3010@gmail.com',
                 subject: "❌ Jenkins Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: """Warning! The build failed.

Project: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Check console output for details:
${env.BUILD_URL}

-- Jenkins CI/CD Bot
"""
        }
    }
}
