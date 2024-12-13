#!/usr/bin/env bash
set -euxo pipefail

if declare -p KEY >/dev/null 2>&1; then
    echo "Using deployer private key from environment variable KEY"
else
    read -p "Enter deployer private key: " KEY
    export KEY="$KEY"
fi

export PROVIDER=https://babel-api.mainnet.iotex.one
export EXPLORER=https://iotexscan.io
export OUTPUT_FILE=iotex-address.txt
./scripts/deploy-without-migrator.js

# might take a while for the iotexscan indexers to notice the contract...
until npx hardhat verify --network iotex $(cat iotex-address.txt); do
    echo "Retrying in 10 seconds..."
    sleep 10
done
