"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const my_rsa_1 = __importDefault(require("my-rsa"));
const bigint_conversion = require('bigint-conversion');
const bigintToHex = bigint_conversion.bigintToHex;
const hexToBigint = bigint_conversion.hexToBigint;
const textToBigint = bigint_conversion.textToBigint;
const BigintToText = bigint_conversion.bigintToText;
const rsa = new my_rsa_1.default();
let mensaje; // This is the data we want to encrypt
class RsaController {
    //rsa = new MyRsa();
    async postRSA(req, res) {
        try {
            console.log("body: ", req.body);
            let msgHEX = req.body.dataCypher;
            console.log("HEX MSG: ", msgHEX);
            let msg = hexToBigint(msgHEX);
            console.log("HEX to BigInt: ", msg);
            if (!rsa.privateKey) {
                await rsa.generateKeys(1024);
            }
            let key = rsa.privateKey;
            let d = key.d;
            let n = key.n;
            console.log("key: ", key, ", d=", d, ", n=", n);
            mensaje = BigintToText(my_rsa_1.default.decrypt(msg, d, n));
            console.log("mensaje descifrado: ", mensaje);
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
        catch {
            res.status(500).json({ "text": 'Internal Server Error' });
        }
    }
    async getRSA(req, res) {
        try {
            if (mensaje == null)
                mensaje = "Introduce tu nombre";
            console.log("Mensaje que envia: ", mensaje);
            let msg = textToBigint(mensaje); //convierte string a bigint
            console.log("mensaje en hex: ", msg); //Hasta aqui bien
            let key = rsa.publicKey; //Falla aqui
            if (!rsa.publicKey) {
                await rsa.generateKeys(1024);
            }
            let e = key.e;
            let n = key.n;
            console.log("key: ", key, ", e=", e, ", n=", n); //Aqui va mal, no salta el console log
            let datacypher = my_rsa_1.default.encrypt(msg, e, n);
            console.log("datacipher: ", datacypher);
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
        catch {
            res.status(500).json({ "text": 'Internal Server Error' });
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
}
const controller = new RsaController();
exports.default = controller;
