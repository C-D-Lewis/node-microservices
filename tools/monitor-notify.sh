#!/bin/bash

set -eu

MESSAGE=$1

RES=$(curl -s -X POST "http://localhost:5959/conduit" \
  -H "Content-Type:application/json" \
  -d "{
    \"to\": \"monitor\",
    \"topic\": \"notify\",
    \"message\": {
      \"content\": \"$MESSAGE\"
    }
  }")

echo "$RES" | jq
