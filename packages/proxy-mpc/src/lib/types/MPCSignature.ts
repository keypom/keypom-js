/**
 * Result Type of MPC contract signature request.
 * Representing Affine Points on eliptic curve.
 * Example: {
    "big_r": {
      "affine_point": "031F2CE94AF69DF45EC96D146DB2F6D35B8743FA2E21D2450070C5C339A4CD418B"
    },
    "s": { "scalar": "5AE93A7C4138972B3FE8AEA1638190905C6DB5437BDE7274BEBFA41DDAF7E4F6"
    },
    "recovery_id": 0
  }
 */

export interface MPCSignature {
    big_r: { affine_point: string };
    s: { scalar: string };
    recovery_id: number;
}
