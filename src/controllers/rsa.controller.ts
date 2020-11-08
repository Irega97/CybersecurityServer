import {Request, Response } from 'express';
import * as crypto from 'crypto';

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
	modulusLength: 2048,
})

// This is the data we want to encrypt
let mensaje: string;

class RsaController {

    public async postRSA (req:Request, res:Response){
        
    }
    
    public async getRSA (req:Request, res:Response){
        try{
            if(mensaje==null) mensaje = "Introduce tu nombre";
            console.log('Petición GET realizada');
            let datacipher = this.encryptData(mensaje, publicKey);
            console.log(datacipher);
            res.status(200).json(datacipher);
        }
        catch{
            res.status(500).json({"text": 'Internal Server Error'});
        }
    }

    public encryptData(msg: string, pubKey:crypto.KeyLike) {
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
    }

    public decryptData(msg: string){ 
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
    }
}

const controller: RsaController = new RsaController();
export default controller;
