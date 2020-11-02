#!/bin/bash

set -eu

./conduit.sh 46.101.3.163 attic get '{"app": "conduit", "key": "fleetList"}' $CONDUIT_TOKEN | jq '.message.value'
