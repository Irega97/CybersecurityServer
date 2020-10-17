import { Request, Response } from 'express';
import crypto, { Cipher } from 'crypto';

import server from '../index'

const secret = 'bobito';
const pswd = 'SCCBD';
const algorithm = 'aes-128-cbc';
const keyAndIv = crypto.pbkdf2Sync(secret, pswd, 1024, 32, 'sha1');
const key = keyAndIv.slice(0, 16);
const iv = keyAndIv.slice(16, 32);

let mensaje : string;

class TextController {

    public async postText (req:Request, res:Response){
        try{
            console.log('Petición POST realizada! Mensaje cifrado:', req.body.text);
            mensaje = decrypt(key,iv,req.body.text);
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
            let datacipher = encrypt(key,iv,mensaje);
            res.status(200).json(datacipher);
        }
        catch{
            res.status(500).json({"text": 'Internal Server Error'});
        }
    }
}

function encrypt(key:Buffer,iv:Buffer,mensaje:string){
    let cipher = crypto.createCipheriv(algorithm,key,iv);
    let encrypted = cipher.update(mensaje,'utf8','hex');
    encrypted += cipher.final('hex');
    console.log('Mensaje cifrado:',encrypted);
    return encrypted;
}

function decrypt(key:Buffer,iv:Buffer,cipherdata:string){
    let decipher = crypto.createDecipheriv(algorithm,key,iv);
    let decrypted = decipher.update(cipherdata,'hex','utf8');
    decrypted+=decipher.final('utf-8');
    console.log('Mensaje descifrado:',decrypted);
    return decrypted;
}

const controller: TextController = new TextController();
export default controller;
