#!/usr/bin/env bash
set -euxo pipefail

if [ -z "$KEY" ]; then
    read -p "Enter deployer private key: " KEY
    export KEY="$KEY"
fi

export PROVIDER=https://babel-api.testnet.iotex.io
export EXPLORER=https://testnet.iotexscan.io
export OUTPUT_FILE=iotex-testnet-address.txt
./scripts/deploy-without-migrator.js

# might take a while for the iotexscan indexers to notice the contract...
until npx hardhat verify --network iotexTestnet $(cat iotex-testnet-address.txt); do
    echo "Retrying in 10 seconds..."
    sleep 10
done
