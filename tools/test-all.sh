#!/bin/bash

set -eu

#
# Test a given app
#
function test () {
  app=$1
  cd apps/$app

  npm start &
  sleep 3
  npm test

  cd -
}

test conduit
test attic
test clacks
test concierge
test guestlist
test visuals
test monitor
# test polaris needs mocking of AWS SDK

# Test node-common
# TODO: Some test modules do not exit
# cd node-common
# npm test
