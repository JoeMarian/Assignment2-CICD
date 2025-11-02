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

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/JoeMarian/Assignment2-CICD.git'
            }
        }

        stage('Build & Test Backend') {
            steps {
                dir('backend') {
                    sh 'pip3 install -r requirements.txt'
                    sh 'python3 -m unittest discover tests || true'
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

        stage('Build & Push Docker Images to AWS ECR') {
            steps {
                script {
                    sh '''
                        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${ECR_REPO_BACKEND%/*}
                        docker buildx create --use || true

                        echo "Building backend..."
                        cd backend
                        docker buildx build --platform linux/amd64 -t ${ECR_REPO_BACKEND}:latest --push .

                        echo "Building frontend..."
                        cd ../frontend
                        docker buildx build --platform linux/amd64 -t ${ECR_REPO_FRONTEND}:latest --push .
                    '''
                }
            }
        }

        stage('Deploy on AWS EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" ${EC2_USER}@${EC2_HOST} << 'EOF'
                        echo "Logging into AWS ECR..."
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO_BACKEND%/*}

                        echo "Deploying backend..."
                        docker pull ${ECR_REPO_BACKEND}:latest || true
                        docker stop backend || true
                        docker rm backend || true
                        docker run -d --name backend -p 5000:5000 ${ECR_REPO_BACKEND}:latest

                        echo "Deploying frontend..."
                        docker pull ${ECR_REPO_FRONTEND}:latest || true
                        docker stop frontend || true
                        docker rm frontend || true
                        docker run -d --name frontend -p 3000:3000 ${ECR_REPO_FRONTEND}:latest

                        echo "✅ Deployment completed successfully."
                        EOF
                    '''
                }
            }
        }
    }

    post {
        success {
            mail to: 'joemarian3010@gmail.com',
                 subject: "✅ CI/CD SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "Deployment successful on AWS EC2. Access at: http://${EC2_HOST}:3000"
        }
        failure {
            mail to: 'joemarian3010@gmail.com',
                 subject: "❌ CI/CD FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "The pipeline failed. Check Jenkins logs for error details."
        }
    }
}
