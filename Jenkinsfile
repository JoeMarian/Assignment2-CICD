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
            sh 'pwd'
            sh 'ls -l'
            sh 'npm install'
            sh 'npm run build'
        }
    }
}


        stage('Build Docker Images') {
            steps {
                script {
                    def backendImage = "${env.ECR_REPO_BACKEND}:latest"
                    def frontendImage = "${env.ECR_REPO_FRONTEND}:latest"

                    dir('backend') {
                        sh "docker build -t ${backendImage} ."
                    }
                    dir('frontend') {
                        sh "docker build -t ${frontendImage} ."
                    }
                }
            }
        }

        stage('Push Images to ECR') {
            steps {
                script {
                    sh '''
                    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${ECR_REPO_BACKEND%/*}
                    '''
                    sh "docker push ${ECR_REPO_BACKEND}:latest"

                    sh '''
                    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${ECR_REPO_FRONTEND%/*}
                    '''
                    sh "docker push ${ECR_REPO_FRONTEND}:latest"
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    sh """
                    ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ${EC2_USER}@${EC2_HOST} << EOF
                    docker pull ${ECR_REPO_BACKEND}:latest
                    docker stop backend || true
                    docker rm backend || true
                    docker run -d --name backend -p 5000:5000 ${ECR_REPO_BACKEND}:latest

                    docker pull ${ECR_REPO_FRONTEND}:latest
                    docker stop frontend || true
                    docker rm frontend || true
                    docker run -d --name frontend -p 3000:3000 ${ECR_REPO_FRONTEND}:latest
                    EOF
                    """
                }
            }
        }
    }

    post {
        success {
            mail to: 'joemarian3010@gmail.com',
                 subject: "Jenkins Build Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "Good news! The build was successful.\n\nCheck the build details at ${env.BUILD_URL}"
        }
        failure {
            mail to: 'joemarian3010@gmail.com',
                 subject: "Jenkins Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "Warning! The build failed.\n\nDetails: ${env.BUILD_URL}"
        }
    }
}
