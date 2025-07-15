#!/bin/bash

# Upload config for this device to the private S3 bucket

set -eu

DEVICE_NAME=$(hostname)
BUCKET_DIR="chrislewis-private/node-microservices-configs"
FULL_URL="s3://$BUCKET_DIR/$DEVICE_NAME.yml"
CONFIG_FILE="config.yml"

# Check config exists
if [ ! -f $CONFIG_FILE ]; then
  echo "Error: config.yml does not exist in the current directory."
  exit 1
fi

# Copy the file for this device
echo "Pushing config for device: $DEVICE_NAME"
aws s3 cp $CONFIG_FILE $FULL_URL
