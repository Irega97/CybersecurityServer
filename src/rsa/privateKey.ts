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

    decrypt (c: any) {
        return this.bcu.modPow(c, this.d, this.publicKey.n);
    }

    sign (m: any) {
        m = this.bc.textToBigint(m);
        return this.bc.bigintToHex(this.bcu.modPow(m, this.d, this.publicKey.n));
    }
  }