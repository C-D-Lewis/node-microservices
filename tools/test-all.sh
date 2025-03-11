#!/bin/bash

set -eu

function run () {
  cd apps/$1
  npm start &
  sleep 3
  cd -
}

#
# Test a given app
#
function test () {
  cd apps/$1
  npm test
  cd -
}

run conduit
run attic
test conduit
test attic

run concierge
test concierge

run clacks
test clacks

run visuals
test visuals

run monitor
test monitor

# TODO: needs mocking of AWS SDK
# run polaris
# test polaris

# Test node-common
cd node-common
npm test
