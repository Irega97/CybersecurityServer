'use strict';

import { PublicKey  as publickey} from "./pubKey";
import { PrivateKey  as privatekey} from "./privateKey";
import { generateKeyPair } from "crypto";

export class RSA {
//import * as bcu from 'bigint-crypto-utils';
 bcu = require('bigint-crypto-utils');
//import * as bc from 'bigint-conversion';
 bc = require('bigint-conversion');
 publicKey: any;
 privateKey: any;
// publicKey = require("../rsa/publicKey");
// privateKey = require("../rsa/privateKey");
// Since we are working with BigInt values, subtract 1 as integer number is not valid, so we create a public constant
 _ONE = BigInt(1);
// We need to generate the coprime "e" in modulus phi(n)
 _E = BigInt(65537);

 async generateRandomKeys  (bitLength = 3072)   {

    let p, q, n, phi;

    // First step is to generate the public modulus as n = p * q
    do {
        p = await this.bcu.prime(Math.floor(bitLength / 2) + 1);
        q =  await this.bcu.prime(Math.floor(bitLength / 2));

        n = p * q;
        // Second step is to compute Euler's totient function
        phi = (p - this._ONE) * (q - this._ONE);
        

    } while (q === p || this.bcu.bitLength(n) !== bitLength || !(this.bcu.gcd(this._E, phi) === this._ONE));
    
    let d = await this.bcu.modInv(this._E, phi);
    
    this.publicKey = new publickey(this._E, n);

    this.privateKey = new privatekey(d, this.publicKey);
    //console.log(privatekey)

    return {publicKey: this.publicKey, privateKey: this.privateKey};
    
    
    }
}