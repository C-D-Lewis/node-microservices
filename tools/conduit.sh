#!/bin/bash

HOST=$1
APP=$2
TOPIC=$3
PORT=5959
PACKET="{\"to\":\"$APP\",\"topic\":\"$TOPIC\"}"

curl -X POST $HOST:$PORT/conduit -H Content-Type:application/json -d "$PACKET"
