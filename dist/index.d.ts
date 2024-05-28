import { Provider, Signer } from "ethers";
import type { DATAv2 } from "./typechain/contracts/DATAv2";
export declare const abi: ({
    inputs: never[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
    name?: undefined;
    outputs?: undefined;
} | {
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    stateMutability?: undefined;
    outputs?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
})[], bytecode: string;
export type { DATAv2 };
export declare function getTokenAt(address: string, signerOrProvider: Provider | Signer): DATAv2;
export declare function deployToken(signer: Signer): Promise<DATAv2>;
