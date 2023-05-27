#!/usr/bin/env bash

set -eu

# HOME is platform and user dependent
HOME=$1
CONFIG_PATH="$HOME/code/node-microservices/launch-config/launchConfig.json"
WAIT_S=15

# Wait for network access
echo "Waiting for network..."
until ping -c 1 -W 1 8.8.8.8; do sleep 1; done
echo ""

# HACK - allow access to gpiomem on Raspberry Pi
sudo chmod a+rwX /dev/gpiomem || true

# Repo update - assume ~/code/ dir
cd "$HOME/code/node-microservices"
git pull origin master
echo ""

# Fetch the launch config and extract for this host
HOSTNAME=$(hostname)
printf ">> Hostname: $HOSTNAME\n"
HOST_CONFIG=$(cat $CONFIG_PATH | jq -r ".hosts[\"$HOSTNAME\"]")
if [[ $HOST_CONFIG =~ null ]]; then
  printf "No launch config for $HOSTNAME\n"
  exit 1
fi

# All paths relative to home directory
cd $HOME
echo $HOST_CONFIG | jq -c '.[]' | while read i; do
  echo ""

  # Get commands for this task
  LOCATION=$(echo $i | jq -r '.location')
  INSTALL=$(echo $i | jq -r '.install')
  START=$(echo $i | jq -r '.start')
  UPDATE=$(echo $i | jq -r '.update')

  # Check LOCATION dir exists, INSTALL if it doesn't
  if [[ ! $LOCATION =~ null ]]; then
    if [ ! -d "$LOCATION" ]; then
      printf ">> Installing: $INSTALL\n"
      eval "$INSTALL"
    fi
  fi

  # Go to LOCATION
  cd $LOCATION
  printf ">> Location: $LOCATION\n"

  # Do any UPDATE
  if [[ ! $UPDATE =~ null ]]; then
    printf ">> Update: $UPDATE\n"

    # Built-in git pull
    if [[ $UPDATE =~ '$git-pull' ]]; then
      git pull origin master
    else
      eval "$UPDATE"
    fi
  fi

  # START task
  printf ">> Start: $START\n"
  if [[ ! $START =~ null ]]; then
    eval "$START"
  fi

  # Prepare for next
  printf ">> Sleep $WAIT_S s\n"
  sleep $WAIT_S
  cd ~
done

printf "\n>>> Launch complete!\n"

# Email report
$(which node) "$HOME/code/node-microservices/launch-config/email.js" >> "$HOME/cronlog.txt" 2>&1
