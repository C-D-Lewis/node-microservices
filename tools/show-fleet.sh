#!/bin/bash

./conduit.sh 46.101.3.163 attic get '{"app": "conduit", "key": "fleetList"}' | jq '.message.value'
