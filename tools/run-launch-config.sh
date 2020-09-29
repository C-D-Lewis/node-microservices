#!/usr/bin/env bash

LC_URL=https://s3.amazonaws.com/public-files.chrislewis.me.uk/launchConfig.json
WAIT_S=10

echo ">> Hostname: $HOSTNAME"
HOSTNAME=$(hostname)

# Fetch the launch config and extract for this host
CONFIG=$(curl -s $LC_URL)
HOST_CONFIG=$(echo $CONFIG | jq -r ".hosts.$HOSTNAME")
if [[ $HOST_CONFIG =~ "null" ]]; then
  echo "No launch config for $HOSTNAME"
fi

# All paths relative to home directory
cd ~
echo $HOST_CONFIG > hostConfig.json
jq -c '.[]' hostConfig.json | while read i; do
  # Get commands for this task
  LOCATION=$(echo $i | jq -r '.location')
  INSTALL=$(echo $i | jq -r '.install')
  START=$(echo $i | jq -r '.start')
  UPDATE=$(echo $i | jq -r '.update')

  # Check LOCATION exists, install and/or update
  if [ ! -d "$LOCATION" ]; then
    echo ">> Installing: $INSTALL"
    eval "$INSTALL"
  fi
  cd $LOCATION
  echo ">> Location: $LOCATION"
  eval "$UPDATE"

  # Launch task in background
  echo ">> Start: $START"
  eval "$START"

  # Prepare for next
  echo ">> Sleep $WAIT_S s"
  sleep $WAIT_S
  cd ~
done
rm hostConfig.json
