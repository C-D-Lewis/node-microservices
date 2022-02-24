#!/bin/bash

set -eu

./conduit.sh conduit.chrislewis.me.uk attic get '{"app": "conduit", "key": "fleetList"}' $CONDUIT_TOKEN | jq '.message.value'
