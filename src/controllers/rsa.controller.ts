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
    console.log("ok");
}

async function getPublicKeyRSA(req: Request, res: Response) {  
    // Función que envía la clave privada al cliente para cifrar
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

async function postPubKeyRSA(req: Request, res: Response) {
    // Función que recoge la clave pública del cliente para cifrar
    try {
      let e = req.body.e;
      let n = req.body.n;
      /* e = bc.hexToBigint(e)
      n =  await bc.hexToBigint(n) */
      pubKeyClient = new PublicKey (bc.hexToBigint(e), bc.hexToBigint(n));
      console.log("pubkey client: ", pubKeyClient);
      return res.status(200).json({message: "Clave enviada con éxito"})
    }
    catch(err) {
      console.log(err);
      res.status(500).json({message: "Internal server error"});
    }
  }

async function postRSA (req:Request, res:Response){
  // Función que descifra mensaje del cliente
  try{
      let msg = req.body.dataCypher;
      console.log('Petición POST realizada! Mensaje cifrado:', msg);
      let mnsjBigInt = await rsa.privateKey.decrypt(bc.hexToBigint(msg));
      mensaje = bc.bigintToText(mnsjBigInt);
      console.log("Mensaje descifrado: " + mensaje);
      return res.status(200).json({"text": mensaje});
  } catch (error) {
      console.log("Error: ", error);
      return res.status(500).json({message: 'Internal Server Error'});
  }
}

async function getRSA (req:Request, res:Response){
  // Función que envía mensaje cifrado al cliente
  try {
    if(mensaje == null) mensaje = "Introduce tu nombre";
    console.log("Mensaje a cifrar: ", mensaje);
    console.log("pub key: ", pubKeyClient);
    let encrypted = await pubKeyClient.encrypt(mensaje);
    /* console.log("pub key: ", rsa.publicKey);
    let encrypted = await rsa.publicKey.encrypt(mensaje); */
    console.log("Mensaje cifrado: ", encrypted);
    return res.status(200).json({dataCypher: encrypted});
  } catch(error) {
      console.log("Error: ", error);
      return res.status(500).json({message: "Internal server error"});
  }
}

export default {getRSA, postRSA, rsaInit, getPublicKeyRSA, postPubKeyRSA};