import {Request, Response } from 'express';
// @ts-ignore
import MyRsa from 'my-rsa';

const bigint_conversion = require('bigint-conversion');
const bigintToHex = bigint_conversion.bigintToHex;
const hexToBigint = bigint_conversion.hexToBigint;
const textToBigint =  bigint_conversion.textToBigint;
const BigintToText = bigint_conversion.bigintToText;

const rsa = new MyRsa();
let mensaje: string; // This is the data we want to encrypt

class RsaController {

    //rsa = new MyRsa();

    public async postRSA (req:Request, res:Response){
        try{
            console.log("body: ", req.body);
            let msgHEX = req.body.dataCypher;
            console.log("HEX MSG: ", msgHEX);
            let msg = hexToBigint(msgHEX);
            console.log('Petición POST realizada! Mensaje cifrado: ', msg);
            if (!rsa.privateKey){
                await rsa.generateKeys(1024);
            }

            let key = rsa.privateKey;
            let d = key.d;
            let n = key.n;

            mensaje = BigintToText(MyRsa.decrypt(msg, d, n));

            let data = {
                mensaje: bigintToHex(mensaje),
                d: bigintToHex(d),
                n: bigintToHex(n)
            };

            res.status(200).json(data);
            console.log("Mensaje descifrado: " + data.mensaje);
            console.log("Private exponent d: " + data.d);
            console.log("Public modulus n: " + data.n);

            /*console.log("Mensaje descifrado: " + mensaje);
            res.status(200).json({"text": mensaje});*/
        }
        catch{
            res.status(500).json({"text": 'Internal Server Error'});
        }
    }

    public async getRSA (req:Request, res:Response){

        try{
            if(mensaje==null) mensaje = "Introduce tu nombre";
            console.log('Petición GET realizada', mensaje);

            let msg = textToBigint(mensaje); //convierte string a bigint
            let key = rsa.publicKey;
            let e = key.e;
            let n = key.n;
            let datacypher = MyRsa.encrypt(msg,e,n);

            let data = {
                dataCypher: bigintToHex(datacypher),
                e: bigintToHex(e),
                n: bigintToHex(n)
            };

            res.status(200).json(data);
            console.log("GET SERVER: " + data.dataCypher);
            console.log("GET e SERVER: " + data.e);
            console.log("GET n SERVER: " + data.n);
        }
        catch{
            res.status(500).json({"text": 'Internal Server Error'});
        }

        /*try{
            if(mensaje==null) mensaje = "Introduce tu nombre";
            console.log('Petición GET realizada');
            let datacipher = this.encryptData(mensaje, publicKey);
            console.log(datacipher);
            res.status(200).json(datacipher);
        }
        catch{
            res.status(500).json({"text": 'Internal Server Error'});
        }*/
    }

   /* public encryptData(msg: string, pubKey:crypto.KeyLike) {
        console.log("ENTRA");
        let cipher = crypto.publicEncrypt(
        {
            key: pubKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        Buffer.from(msg));
        
        // The encrypted data is in the form of bytes, so we print it in base64 format
        // so that it's displayed in a more readable form
        console.log("encrypted data: ", cipher.toString("base64"));
        return cipher;
    }*/

  /*  public decryptData(msg: string){
        let decipher = crypto.privateDecrypt(
        {
            key: privateKey,
            // In order to decrypt the data, we need to specify the
            // same hashing function and padding scheme that we used to
            // encrypt the data in the previous step
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        Buffer.from(msg));
        console.log("Decrypted message: ", decipher.toString("base64"));
        return decipher;
    }*/
}

const controller: RsaController = new RsaController();
export default controller;
