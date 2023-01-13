import { DropConfig } from "./drops";
import { FCData } from "./fc";
import { FTData } from "./ft";
import { NFTData } from "./nft";
import { SimpleData } from "./simple";
export interface KeyInfo {
    dropId: string;
    publicKey: string;
    curKeyUse: number;
    remainingUses: number;
    lastUsed: number;
    allowance: number;
    keyId: number;
}
export interface Drop {
    dropId: string;
    ownerId: string;
    depositPerUse: string;
    simple?: SimpleData;
    nft?: NFTData;
    ft?: FTData;
    fc?: FCData;
    config?: DropConfig;
    metadata?: string;
    registeredUses: number;
    requiredGas: string;
    nextKeyId: number;
}
export interface ContractSourceMetadata {
    version: string;
    link: string;
}
