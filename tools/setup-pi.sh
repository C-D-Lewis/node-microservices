#!/bin/bash

set -eu

export HOME=/home/pi

# Upgrade
echo ""
echo ">>> Full upgrade"
sudo apt-get update && sudo apt-get upgrade -y
sudo apt full-upgrade

# Aliases
echo ""
echo ">>> Adding aliases"
cat <<'EOF' >> $HOME/.bash_aliases
alias gs="git status"
alias gp="git push origin"
alias gc="git commit -m"
alias gf="git fetch"
EOF
source $HOME/.bash_aliases

# Git
echo ""
echo ">>> Setting up git"
sudo apt install -y git
git config --global credential.helper store
git config --global pull.rebase false
git config --global --add safe.directory /home/pi/code/node-microservices

# Other apt installs
echo ""
echo ">>> Installing other packages"
sudo apt install -y jq

# Node.js
echo ""
echo ">>> Installing Node.js"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install 20
nvm use 20
nvm alias default 20

sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/node" "/usr/local/bin/node"
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/npm" "/usr/local/bin/npm"
sudo ln -s /usr/local/bin/node /usr/bin/node
sudo ln -s /usr/local/lib/node /usr/lib/node
sudo ln -s /usr/local/bin/npm /usr/bin/npm

# NMS
echo ""
echo ">>> Setting up node-microservices"
cd $HOME
mkdir -p code
cd code
git clone https://github.com/c-d-lewis/node-microservices

echo ""
echo ">>> Installing deps for conduit and attic"
cd node-microservices/node-common
npm i
cd ../tools/cli
npm i
npm i -g .
cd ../apps/conduit
npm i
cd ../attic
npm i

echo "Setting ownership"
cd $HOME
sudo chown -R pi ./

echo ""
echo ">>> All done!"
