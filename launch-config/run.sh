#!/usr/bin/env bash

# All available options per host:
#   dir:    Path to the directory to run 'cmd'
#   update: Command to update the task if 'dir' exists
#   cmd:    Command to start the task
#   nms:    Start an NMS app

set -eu

# HOME is platform and user dependent
HOME=$1
NMS_HOME="$HOME/code/node-microservices"
CONFIG_PATH="$NMS_HOME/launch-config/launchConfig.json"
WAIT_S=10

# Wait for network access
echo "Waiting for network..."
until ping -c 1 -W 1 8.8.8.8; do sleep 1; done
echo ""

# HACK - allow access to gpiomem on Raspberry Pi
sudo chmod a+rwX /dev/gpiomem || true

# Main repo update - assume ~/code/ dir
cd $NMS_HOME
git pull origin master
echo ""

HOSTNAME=$(hostname)
printf ">> Hostname: $HOSTNAME\n"

# Fetch the launch config and extract for this host
HOST_CONFIG=$(cat $CONFIG_PATH | jq -r ".hosts[\"$HOSTNAME\"]")
if [[ $HOST_CONFIG =~ null ]]; then
  printf "No launch config for $HOSTNAME\n"
  exit 1
fi

# All paths are relative to home directory
cd $HOME
echo $HOST_CONFIG | jq -c '.[]' | while read i; do
  echo ""

  # Get parameters for this task
  DIR=$(echo $i | jq -r '.dir')
  CMD=$(echo $i | jq -r '.cmd')
  UPDATE=$(echo $i | jq -r '.update')
  NMS=$(echo $i | jq -r '.nms')

  # Go to dir
  if [[ ! $DIR =~ null ]]; then
    if [ ! -d "$DIR" ]; then
      printf ">> Location: $DIR does not exist\n"
      exit 1
    fi

    cd $DIR
    printf ">> Location: $DIR\n"
  fi

  # Do any update command
  if [[ ! $UPDATE =~ null ]]; then
    printf ">> Update: $UPDATE\n"
    eval "$UPDATE"
  fi

  # Start nms app
  if [[ ! $NMS =~ null ]]; then
    printf ">> nms launch: $NMS\n"
    cd $NMS_HOME/apps/$NMS && npm run start &
  fi

  # Start task in background
  if [[ ! $CMD =~ null ]]; then
    printf ">> Start: $CMD\n"
    eval "$CMD &"
  fi

  # Prepare for next
  printf ">> Waiting $WAIT_S s\n"
  sleep $WAIT_S
  cd ~
done

printf "\n>>> Launch complete!\n"

# Email report with monitor plugin
