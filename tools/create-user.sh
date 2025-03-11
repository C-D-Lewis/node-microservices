#!/bin/bash

set -eu

NAME=$1
APPS=$2
TOPICS=$3
DEVICES=$4

# db.json file location
DB_FILE="apps/attic/db.json"

if [[ "$NAME" =~ \  ]]; then
  echo "Error: NAME contains spaces"
  exit 1
fi

if [[ ! -f "$DB_FILE" ]]; then
  echo "Error: db.json not found"
  exit 1
fi

list=$(jq -r '.conduit.users.value' "$DB_FILE")
if [[ "$list" == "null" ]]; then
  echo "Error: No users found in the database"
  exit 1
fi

user=$(echo "$list" | jq -r --arg NAME "$NAME" '.[] | select(.name == $NAME)')
if [[ -n "$user" ]]; then
  echo "Error: User with name $NAME already exists"
  exit 1
fi

# Generate user data
id=$(uuidgen)
token=$(uuidgen)
hash=$(echo -n "$token" | sha256sum | cut -d' ' -f1)
echo ""
echo "id: $id"
echo "token: $token"
echo "hash: $hash"

timestamp=$(date +%s)

# Add user to the database
jq --arg ID "$id" \
  --arg NAME "$NAME" \
  --arg APPS "$APPS" \
  --arg TOPICS "$TOPICS" \
  --arg DEVICES "$DEVICES" \
  --arg HASH "$hash" \
  --arg TIMESTAMP "$timestamp" \
  '.conduit.users.value += [{id: $ID, name: $NAME, apps: $APPS, topics: $TOPICS, devices: $DEVICES, hash: $HASH, createdAt: $TIMESTAMP}]' \
  "$DB_FILE" > "$DB_FILE.tmp"
cp "$DB_FILE.tmp" "$DB_FILE"

echo ""
echo "Completed"
