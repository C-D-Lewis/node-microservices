#!/bin/bash

set -eu

docker run --rm -it \
  --name node-microservices \
  -p 5959:5959 \
  node-microservices:latest