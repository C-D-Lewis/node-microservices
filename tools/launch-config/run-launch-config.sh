#!/usr/bin/env bash

set -eu

# Wait for network access
echo "Waiting for network..."
until ping -c 1 -W 1 8.8.8.8; do sleep 1; done

# HOME is platform dependent
HOME=$1

LC_URL=https://s3.amazonaws.com/public-files.chrislewis.me.uk/launchConfig.json
WAIT_S=10

printf "\n>> Hostname: $HOSTNAME\n"
HOSTNAME=$(hostname)

# Fetch the launch config and extract for this host
CONFIG=$(curl -s $LC_URL)
HOST_CONFIG=$(echo $CONFIG | jq -r ".hosts[\"$HOSTNAME\"]")
if [[ $HOST_CONFIG =~ null ]]; then
  printf "\nNo launch config for $HOSTNAME\n"
  exit 1
fi

# All paths relative to home directory
cd $HOME
echo $HOST_CONFIG > hostConfig.json
jq -c '.[]' hostConfig.json | while read i; do
  # Get commands for this task
  LOCATION=$(echo $i | jq -r '.location')
  INSTALL=$(echo $i | jq -r '.install')
  START=$(echo $i | jq -r '.start')
  UPDATE=$(echo $i | jq -r '.update')

  # Check LOCATION exists, INSTALL if it doesn't
  if [[ ! $LOCATION =~ null ]]; then
    if [ ! -d "$LOCATION" ]; then
      printf "\n>> Installing: $INSTALL\n"
      eval "$INSTALL"
    fi
  fi

  # Go to LOCATION
  cd $LOCATION
  printf "\n>> Location: $LOCATION\n"

  # Do any UPDATE
  if [[ ! $UPDATE =~ null ]]; then
    printf "\n>> Update: $UPDATE\n"

    # Built-in git pull
    if [[ $UPDATE =~ '$git-pull' ]]; then
      git pull origin master
    else
      eval "$UPDATE"
    fi
  fi

  # START task in background
  printf "\n>> Start: $START\n"
  # Built-in npm start
  if [[ $START =~ '$npm-ci-start' ]]; then
    npm ci && npm start &
  else
    eval "$START"
  fi

  # Prepare for next
  printf "\n>> Sleep $WAIT_S s\n"
  sleep $WAIT_S
  cd ~
done
rm hostConfig.json

printf "\n>>> Launch complete!\n"
