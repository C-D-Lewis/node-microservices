#!/bin/bash

HOST=$1
PACKET=$2
PORT=5959

curl -X POST $HOST:$PORT/conduit -H Content-Type:application/json -d $PACKET
