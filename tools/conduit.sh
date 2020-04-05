#!/bin/bash

# Example:
#  ./conduit.sh 192.168.1.107 BacklightServer set '{"all": [128,128,128]}'

# Authorization comes after payload, if requried
#  ./conduit.sh localhost guestlist create '{"name": "test"...}' $adminPassword

PORT=5959
MESSAGE=${4:-"{}"}
AUTH=$5
PACKET="{\"to\":\"$2\",\"topic\":\"$3\",\"message\":$MESSAGE,\"auth\":\"$AUTH\"}"
echo $PACKET

curl -X POST $1:$PORT/conduit -H Content-Type:application/json -d "$PACKET" -s
echo ''
