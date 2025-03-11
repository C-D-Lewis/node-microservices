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
run guestlist
run concierge
run clacks
run visuals
run monitor

test conduit
test attic
test guestlist
test concierge
test clacks
test visuals
test monitor

# TODO: needs mocking of AWS SDK
# run polaris
# test polaris

# Test node-common
cd node-common
npm test
