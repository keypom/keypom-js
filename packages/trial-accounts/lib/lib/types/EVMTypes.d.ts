export interface SerializableParam {
    name: string;
    kind: SerializableParamType;
}
export type SerializableParamType = {
    type: "Address";
} | {
    type: "Bytes";
} | {
    type: "Int";
    value: number;
} | {
    type: "Uint";
    value: number;
} | {
    type: "Bool";
} | {
    type: "String";
} | {
    type: "Array";
    value: SerializableParamType;
} | {
    type: "FixedBytes";
    value: number;
} | {
    type: "FixedArray";
    value: {
        inner: SerializableParamType;
        size: number;
    };
} | {
    type: "Tuple";
    value: SerializableParamType[];
};
export type SerializableToken = {
    type: "Address";
    value: string;
} | {
    type: "FixedBytes";
    value: string;
} | {
    type: "Bytes";
    value: string;
} | {
    type: "Int";
    value: string;
} | {
    type: "Uint";
    value: string;
} | {
    type: "Bool";
    value: boolean;
} | {
    type: "String";
    value: string;
} | {
    type: "FixedArray";
    value: SerializableToken[];
} | {
    type: "Array";
    value: SerializableToken[];
} | {
    type: "Tuple";
    value: SerializableToken[];
};
export interface AccessListItem {
    address: string;
    storageKeys: string[];
}
export type AccessList = AccessListItem[];
