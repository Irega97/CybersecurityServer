export class PublicKey {
    e: any;
    n: any;
    bcu = require('bigint-crypto-utils');
    //import * as bc from 'bigint-conversion';
    bc = require('bigint-conversion');
    constructor(e: any, n: any) {
      this.e = e;
      this.n = n;
    }

    encrypt (m: bigint) {
        return this.bcu.modPow(m, this.e, this.n);
    }

    verify (s: bigint) {
        return this.bcu.modPow(s, this.e, this.n);
    }

  }