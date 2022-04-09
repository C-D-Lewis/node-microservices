#!/usr/bin/env bash

# Directories
mkdir code Downloads

# Install software
sudo apt-get update && sudo apt-get upgrade -y
sudo apt install git jq
git config --global credential.helper store

# Install aliases
echo 'alias gs="git status"' >> ~/.bash_aliases
echo 'alias gp="git push origin"' >> ~/.bash_aliases
echo 'alias gc="git commit -m"' >> ~/.bash_aliases
echo 'alias gf="git fetch"' >> ~/.bash_aliases

# Install node and npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install 14
npm i -g npm@^7
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/node" "/usr/local/bin/node"
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/npm" "/usr/local/bin/npm"

# Install node-microservices
cd code/
git clone https://github.com/c-d-lewis/node-microservices
cd node-microservices/node-common
npm ci
cd ../tools/cli/
npm ci
npm i -g .

# Install nms apps
cd ../../apps/conduit/
npm ci
npm start
cd ../attic/
npm ci
npm start

echo 'Some config.json files need manual completion'
echo 'Complete!'
