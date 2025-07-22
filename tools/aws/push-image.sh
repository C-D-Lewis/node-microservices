#!/bin/bash

set -eu

ECR_NAME="node-microservices-ecr"
IMAGE_NAME="node-microservices"

# Create image
docker build -f Dockerfile.aws -t $IMAGE_NAME .

# Get details
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
RES=$(aws ecr describe-repositories --region us-east-1 --repository-names $ECR_NAME)
ECR_URI="$(echo $RES | jq -r '.repositories[0].repositoryUri')"

# Tag and push image to ECR
TARGET="$ECR_URI:latest"
docker tag $IMAGE_NAME $TARGET
docker push $TARGET
