import { Request, Response } from 'express';
var CryptoJS = require("crypto-js")

var secretKey = CryptoJS.enc.Hex.parse("4b173f3b3c2366674695d1a17a04752a");

var mensaje : string;

class TextController {

    public async postText (req:Request, res:Response){
        try{
            let iv = req.body.iv;
            let msg = req.body.cipherText;
            console.log('Petición POST realizada! Mensaje cifrado:', msg);
            mensaje = decrypt(secretKey,iv,msg);
            console.log("Mensaje descifrado: " + mensaje);
            return res.status(200).json({"text": mensaje});
        }
        catch{
            return res.status(500).json({"text": 'Internal Server Error'});
        }
    }
    
    public async getText (req:Request, res:Response){
        try{
            if(mensaje==null) mensaje = "Introduce tu nombre";
            console.log('Petición GET realizada');
            var iv = CryptoJS.lib.WordArray.random(128/8);
            let datacipher = encrypt(secretKey,iv,mensaje);
            let data = {
                dataCypher: datacipher,
                iv: iv
            };
            res.status(200).json(data);
            console.log("GET SERVER: " + data.dataCypher);
            console.log("GET IV SERVER: " + data.iv);
        }
        catch{
            res.status(500).json({"text": 'Internal Server Error'});
        }
    }
}

function encrypt(key:string,iv:Buffer,mensaje:string){
    let encrypted = CryptoJS.AES.encrypt(mensaje,key,{iv:iv}).toString(CryptoJS.enc.utf8)
    return encrypted;
}

function decrypt(key:Buffer,iv:Buffer,mensaje:string){
    let decrypted = CryptoJS.AES.decrypt(mensaje,key, {iv:iv}).toString(CryptoJS.enc.utf8);
    let msg = hex_to_ascii(decrypted);
    return msg;
}

function hex_to_ascii(msg: string)
 {
	var hex  = msg.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
	return str;
 }

const controller: TextController = new TextController();
export default controller;
