import { Signer } from "@ethersproject/abstract-signer";
import { Provider } from "@ethersproject/providers";
import type { DATAv2 } from "./typechain/DATAv2";
export declare const abi: ({
    type: string;
    inputs: {
        indexed?: boolean; // events
        internalType: string;
        name: string;
        type: string;
    }[];
    name?: string; // constructor doesn't have name
    stateMutability?: string;
    anonymous?: boolean; // events
    outputs?: {
        internalType: string;
        name: string;
        type: string;
    }[];
})[], bytecode: string;
export type { DATAv2 };
export declare function getTokenAt(address: string, signerOrProvider: Provider | Signer): DATAv2;
export declare function deployToken(signer: Signer): Promise<DATAv2>;
