import { hexToBigint } from "bigint-conversion";

export class PublicKey {
    e: any;
    n: any;
    bcu = require('bigint-crypto-utils');
    //import * as bc from 'bigint-conversion';
    bc = require('bigint-conversion');
    constructor(e: any, n: any) {
      /* this.e = BigInt(e);
      this.n = BigInt(n); */
      this.e = e;
      this.n = n;
    }

    encrypt (m: any) {
        m = this.bc.textToBigint(m);
        console.log("n encrypt: ", this.n);
        return this.bc.bigintToHex(this.bcu.modPow(m, this.e, this.n));
    }

    verify (s: any) {
        return this.bcu.modPow(s, this.e, this.n);
    }

  }