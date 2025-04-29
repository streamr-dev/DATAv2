#! /bin/bash

rm -rf flattened
mkdir -p flattened
npx hardhat flatten contracts/DATAv2.sol > temp.sol
grep -v SPDX-License-Identifier temp.sol > temp2.sol
grep -v "pragma" temp2.sol > temp.sol
echo "// SPDX-License-Identifier: MIT" > temp2.sol
echo "pragma experimental ABIEncoderV2;" >> temp2.sol
echo "pragma solidity 0.8.6;" >> temp2.sol
cat temp.sol >> temp2.sol
mv temp2.sol flattened/DATAv2.sol
rm temp.sol
