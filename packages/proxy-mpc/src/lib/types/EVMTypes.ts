// lib/types/EVMTypes.ts

export interface SerializableParam {
    name: string;
    kind: SerializableParamType;
}

export type SerializableParamType =
    | { type: "Address" }
    | { type: "Bytes" }
    | { type: "Int"; value: number }
    | { type: "Uint"; value: number }
    | { type: "Bool" }
    | { type: "String" }
    | { type: "Array"; value: SerializableParamType }
    | { type: "FixedBytes"; value: number }
    | {
          type: "FixedArray";
          value: { inner: SerializableParamType; size: number };
      }
    | { type: "Tuple"; value: SerializableParamType[] };

export type SerializableToken =
    | { type: "Address"; value: string } // address as hex string
    | { type: "FixedBytes"; value: string } // hex string
    | { type: "Bytes"; value: string } // hex string
    | { type: "Int"; value: string } // value as string
    | { type: "Uint"; value: string } // value as string
    | { type: "Bool"; value: boolean }
    | { type: "String"; value: string }
    | { type: "FixedArray"; value: SerializableToken[] }
    | { type: "Array"; value: SerializableToken[] }
    | { type: "Tuple"; value: SerializableToken[] };

export interface AccessListItem {
    address: string; // hex string of the address
    storageKeys: string[]; // array of hex strings representing storage keys
}

export type AccessList = AccessListItem[];
