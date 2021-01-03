import { bigintToHex, textToBigint } from 'bigint-conversion';
import {Request, Response } from 'express';
import { PublicKey } from '../rsa/pubKey';
const bc = require('bigint-conversion');
import { RSA as classRSA } from "../rsa/rsa";

let mensaje: string;
let rsa = new classRSA;
let pubKeyClient: any;
let keyPair: any;

async function rsaInit(){ //Función que se ejecuta en index.ts
    // GENERA PAR DE LLAVES RSA (public & private)
    console.log("Generando claves . . .")
    keyPair = await rsa.generateRandomKeys();
    console.log("CLAVE PÚBLICA");
    console.log("e: ", rsa.publicKey.e);
    console.log("n: ", rsa.publicKey.n);
    console.log("Claves generadas con éxito!");
}

// Función que envía la clave privada al cliente para cifrar
async function getPublicKeyRSA(req: Request, res: Response) {  
    try {
        let data = {
          e: await bc.bigintToHex(rsa.publicKey.e),
          n: await bc.bigintToHex(rsa.publicKey.n)
        }
        console.log(data);
        res.status(200).send(data);
    }
    catch(err) {
        console.log("ERROR AL RECIBIR: " + err);
        res.status(500).json({message: "Internal server error"})   
    }
}

// Función que recoge la clave pública del cliente para cifrar
async function postPubKeyRSA(req: Request, res: Response) {
    try {
      let e = req.body.e;
      let n = req.body.n;
      pubKeyClient = new PublicKey (bc.hexToBigint(e), bc.hexToBigint(n));
      console.log("pubkey client: ", pubKeyClient);
      return res.status(200).json({message: "Clave enviada con éxito"})
    }
    catch(err) {
      console.log(err);
      res.status(500).json({message: "Internal server error"});
    }
  }

// Función que descifra mensaje del cliente
async function postRSA (req:Request, res:Response){
  try{
      let msg = req.body.dataCypher;
      let mnsjBigInt = await rsa.privateKey.decrypt(bc.hexToBigint(msg));
      mensaje = bc.bigintToText(mnsjBigInt);
      return res.status(200).json({"text": "Hola "+mensaje});
  } catch (error) {
      console.log("Error: ", error);
      return res.status(500).json({message: 'Internal Server Error'});
  }
}

// Función que envía mensaje cifrado al cliente
async function getRSA (req:Request, res:Response){
  try {
    if(mensaje == null) mensaje = "Introduce tu nombre";
    let encrypted = await pubKeyClient.encrypt(textToBigint(mensaje));
    return res.status(200).json({dataCypher: bigintToHex(encrypted)});
  } catch(error) {
      console.log("Error: ", error);
      return res.status(500).json({message: "Internal server error"});
  }
}

async function blindSignature(req: Request, res: Response){
  try{
    let msg = req.body.mensaje;
    let encrypted = await rsa.privateKey.sign(textToBigint(msg));
    return res.status(200).json({dataSigned: bigintToHex(encrypted)});
  } catch (err) {
    return res.status(500).json(err);
  }
}

export default {getRSA, postRSA, rsaInit, getPublicKeyRSA, postPubKeyRSA, blindSignature};