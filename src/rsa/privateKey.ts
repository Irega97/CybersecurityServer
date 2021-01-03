import { PublicKey  as publickey} from "../rsa/pubKey";

export class PrivateKey{
    d: BigInt;
    publicKey: publickey;
    bcu = require('bigint-crypto-utils');
//import * as bc from 'bigint-conversion';
    bc = require('bigint-conversion');
    
    constructor (d: BigInt, publicKey: publickey) {
        this.d = BigInt(d);
        this.publicKey = publicKey;
    }

    decrypt (c: bigint) {
        return this.bcu.modPow(c, this.d, this.publicKey.n);
    }

    sign (m: bigint) {
        return this.bcu.modPow(m, this.d, this.publicKey.n);
    }
  }