"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployToken = exports.getTokenAt = exports.bytecode = exports.abi = void 0;
const ethers_1 = require("ethers");
const dataV2json = __importStar(require("./artifacts/contracts/DATAv2.sol/DATAv2.json"));
exports.abi = dataV2json.abi, exports.bytecode = dataV2json.bytecode;
function getTokenAt(address, signerOrProvider) {
    return new ethers_1.Contract(address, exports.abi, signerOrProvider);
}
exports.getTokenAt = getTokenAt;
async function deployToken(signer) {
    const factory = new ethers_1.ContractFactory(exports.abi, exports.bytecode, signer);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    return contract;
}
exports.deployToken = deployToken;
