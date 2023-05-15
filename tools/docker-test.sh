#!/bin/bash

docker build -t node-microservices .
docker run --rm -t node-microservices
