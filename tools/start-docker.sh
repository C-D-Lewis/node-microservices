#!/bin/bash

set -eu

APP=$1

docker build -t $APP -f Dockerfile.app --build-arg APP=$APP .

docker run -d --rm --name $APP -it $APP
