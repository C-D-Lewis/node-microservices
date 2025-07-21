#!/bin/bash

docker build -f Dockerfile.test -t node-microservices .

docker run --rm -t node-microservices
