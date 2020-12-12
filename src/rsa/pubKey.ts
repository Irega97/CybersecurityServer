export class PublicKey {
    e: BigInt;
    n: BigInt;
    bcu = require('bigint-crypto-utils');
    //import * as bc from 'bigint-conversion';
    bc = require('bigint-conversion');
    constructor(e: any, n: any) {
      this.e = BigInt(e);
      this.n = BigInt(n);
    }

    encrypt (m: any) {
        m = this.bc.textToBigint(m);
        return this.bc.bigintToHex(this.bcu.modPow(m, this.e, this.n));
    }

    verify (s: any) {
        return this.bcu.modPow(s, this.e, this.n);
    }

  }