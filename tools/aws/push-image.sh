#!/bin/bash

set -eu

# Create image
docker build -f Dockerfile.aws -t node-microservices .

