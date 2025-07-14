#!/bin/bash

# Fetch config for this device from the private S3 bucket

set -eu

DEVICE_NAME=$(hostname)
BUCKET_DIR="chrislewis-private/node-microservices-configs"
FULL_URL="s3://$BUCKET_DIR/$DEVICE_NAME.yml"

# Copy the file for this device
echo "Fetching config for device: $DEVICE_NAME"
aws s3 cp $FULL_URL config.yml
