#!/bin/bash

PORT=5959
MESSAGE=${4:-"{}"}
PACKET="{\"to\":\"$2\",\"topic\":\"$3\",\"message\":$MESSAGE}"

curl -X POST $1:$PORT/conduit -H Content-Type:application/json -d "$PACKET"
echo ''