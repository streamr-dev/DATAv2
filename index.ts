import { Signer } from "@ethersproject/abstract-signer"
import { Provider } from "@ethersproject/providers"
import { Contract, ContractFactory } from "@ethersproject/contracts"

import * as dataV2json from "./artifacts/contracts/DATAv2.sol/DATAv2.json"
import type { DATAv2 } from "./typechain/DATAv2"

export const { abi, bytecode } = dataV2json
export type { DATAv2 }

export function getTokenAt(address: string, signerOrProvider: Provider | Signer): DATAv2 {
    return new Contract(address, abi, signerOrProvider) as unknown as DATAv2
}

export async function deployToken(signer: Signer): Promise<DATAv2> {
    const factory = new ContractFactory(abi, bytecode, signer)
    const contract = await factory.deploy() as unknown as DATAv2
    return contract.deployed()
}
