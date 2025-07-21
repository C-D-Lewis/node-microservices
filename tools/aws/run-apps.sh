#!/bin/bash

# Launch the apps listed in Dockerfile.aws
# TODO: Parameterize this to run any app in the apps directory

set -eu

nms apps conduit start
nms apps attic start
nms apps monitor start

sleep infinity
