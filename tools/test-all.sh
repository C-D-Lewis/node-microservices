#!/bin/bash

set -eu

function run () {
  app=$1
  cd apps/$app

  npm start &
  sleep 3

  cd -
}

#
# Test a given app
#
function test () {
  app=$1
  cd apps/$app

  npm test

  cd -
}

# Should be running for conduit guestlist check
run conduit
run attic
run guestlist
test conduit
test attic
test guestlist

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
