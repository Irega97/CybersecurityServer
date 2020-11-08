import { Request, Response } from 'express';
import crypto from 'crypto';
var CryptoJS = require("crypto-js")

import server from '../index'

/* const secret = 'bobito';
const pswd = 'SCCBD';
const algorithm = 'aes-128-cbc';
const keyAndIv = crypto.pbkdf2Sync(secret, pswd, 1024, 32, 'sha1');
const key = keyAndIv.slice(0, 16);
const iv = keyAndIv.slice(16, 32); */

const secretKey = CryptoJS.enc.Hex.parse("4b173f3b3c2366674695d1a17a04752a");

var mensaje : string;

console.log('key:', secretKey);

class TextController {

    public async postText (req:Request, res:Response){
        try{
            console.log("BODY:"+req.body.text.cipherText);
            console.log('Petición POST realizada! Mensaje cifrado:', req.body.text.cipherText);
            let iv = req.body.text.iv;
            let mensaje = req.body.text.cipherText;
            mensaje = decrypt(secretKey,iv,mensaje);
            console.log("HOLI: " + mensaje);
            res.status(200).json({"text": mensaje});
        }
        catch{
            res.status(500).json({"text": 'Internal Server Error'});
        }
    }
    
    public async getText (req:Request, res:Response){
        try{
            if(mensaje==null) mensaje = "Mensaje por defecto";
            console.log('Petición GET realizada');
            var iv = CryptoJS.lib.WordArray.random(128/8);
            let datacipher = encrypt(secretKey,iv,mensaje);
            let data = {
                dataCipher: datacipher,
                iv: iv
            }
            res.status(200).json(data);
        }
        catch{
            res.status(500).json({"text": 'Internal Server Error'});
        }
    }
}

function encrypt(key:string,iv:Buffer,mensaje:string){
    let cipher = crypto.createCipheriv('aes-128-cbc',key,iv);
    let encrypted = cipher.update(mensaje,'utf8','hex');
    encrypted += cipher.final('hex');
    console.log('Mensaje cifrado:',encrypted);
    return encrypted;
}

function decrypt(key:Buffer,iv:Buffer,cipherdata:string){
    let decipher = crypto.createDecipheriv('aes-128-cbc',key,iv);
    let decrypted = decipher.update(cipherdata,'hex','utf8');
    decrypted+=decipher.final('utf-8');
    console.log('Mensaje descifrado:',decrypted);
    return decrypted;
}

const controller: TextController = new TextController();
export default controller;
