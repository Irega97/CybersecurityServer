import { PublicKey  as publickey} from "./pubKey";
import { PrivateKey  as privatekey} from "./privateKey";

export class RSA {
 bcu = require('bigint-crypto-utils');
 bc = require('bigint-conversion');
 publicKey: any;
 privateKey: any;

// Al trabajar con BigInt, no podemos restar 1 como un int, por eso creamos una constante pública
 _ONE = BigInt(1);
// Generamos una constante para "e" en módulo phi(n)
 _E = BigInt(65537);

 async generateRandomKeys  (bitLength = 3072)   {

    let p, q, n, phi;

    // Generamos el módulo público n = p * q
    do {
        p = await this.bcu.prime(Math.floor(bitLength / 2) + 1);
        q =  await this.bcu.prime(Math.floor(bitLength / 2));

        n = p * q;
        // Función coeficiente Euler
        phi = (p - this._ONE) * (q - this._ONE);
        

    } while (q === p || this.bcu.bitLength(n) !== bitLength || !(this.bcu.gcd(this._E, phi) === this._ONE));
    
    let d = await this.bcu.modInv(this._E, phi);
    
    this.publicKey = new publickey(this._E, BigInt(n));

    this.privateKey = new privatekey(d, this.publicKey);

    return {publicKey: this.publicKey, privateKey: this.privateKey};
    }
}