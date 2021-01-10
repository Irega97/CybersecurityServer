import { PublicKey } from './../rsa/pubKey';
import { bigintToHex, hexToBigint, textToBigint } from 'bigint-conversion';
import {Request, Response } from 'express';
import { RSA as classRSA } from "../rsa/rsa";
import * as socket from 'socket.io-client';

const rsa = new classRSA;
const bc = require('bigint-conversion');
const sha = require('object-sha');
const axios = require('axios');
const shamirs = require('shamirs-secret-sharing');
const crypto = require('crypto');

const server  = require('socket.io')(3002, {
  path: '',
  serveClient: false,
  // below are engine.IO options
  pingInterval: 1000,
  pingTimeout: 6000,
  cookie: false,
  cors: {
    origin: "http://localhost:4200",
    credentials: true
  }
});

let clientCount = 0;
let sliceCount = 0;

let clientsSecrets : ArrayBuffer[] = [];
let totalSecret;

let sockets: any [] = [];
// Mensajes de Sockets

server.on('connection', async (socket: any) => {
  clientCount++;
  sockets.push(socket);
  console.log("Sockets: ", sockets.length);
  console.log("Nuevo cliente conectado, total: "+clientCount);

  if(clientCount==5) {
    let secret:Buffer = crypto.randomBytes(64);
    console.log("Nuevo secreto generado: ");
    console.log({secret: bc.bufToHex(secret)});
    let slices:Array<string> = await sliceSecret(secret);
    console.log("Secreto troceado: ");
    console.log({slices:slices});
    sockets.forEach((s) => {
      s.emit('secret',{
          slice:slices.pop()
      });
    });
  }

  socket.emit('connected',"Conexión con socket establecida!");

  socket.on('slice', async (slice: any) => {
      sliceCount++;
      console.log("Ha llegado un trozo: ");
      console.log({slice: slice});
      console.log("Hay "+sliceCount+" trozos");
      server.emit('request','Alguien quiere recuperar el secreto');
      clientsSecrets.push(bc.hexToBuf(slice));
      if(sliceCount==3) {
          totalSecret = await shamirs.combine(clientsSecrets);
          console.log("Ahora podemos recuperar el secreto! Secreto:");
          console.log({secret: bc.bufToHex(totalSecret)});
          server.emit('recovered',bc.bufToHex(totalSecret));
          sliceCount=0;
      }
  });

  socket.on('disconnect', (socket: any) => {
      clientCount--;
      sockets.splice(sockets.indexOf(socket), 1);
      console.log("Sockets: ", sockets.length);
      console.log("Cliente desconectado, total: "+clientCount);
  });
});

let mensaje: string;
let pubKeyClient: PublicKey;
let pubKeyTTP: PublicKey;
let keyPair: any;
let c: any;
let po: any;
let pr: any;
let pkp: any;
let pko: any;

async function rsaInit(){ //Función que se ejecuta en index.ts
    // GENERA PAR DE LLAVES RSA (public & private)
    console.log("Generando claves . . .")
    keyPair = await rsa.generateRandomKeys();
    console.log("CLAVE PÚBLICA");
    console.log("e: ", rsa.publicKey.e);
    console.log("n: ", rsa.publicKey.n);
    console.log("Claves generadas con éxito!");
    getPubKeyTTP();
}

async function getPubKeyTTP(){
  axios.get('http://localhost:3001/ttp/pubkey').then((res: any) => {
    let body = res.data;
    pubKeyTTP = new PublicKey(bc.hexToBigint(body.pubKey.e), bc.hexToBigint(body.pubKey.n));
    console.log("TTP Public Key: {e: ", pubKeyTTP.e, ", n: ", pubKeyTTP.n, "}");
  })
}

// Función que envía la clave privada al cliente para cifrar
async function getPublicKeyRSA(req: Request, res: Response) {  
    try {
        let data = {
          e: await bc.bigintToHex(rsa.publicKey.e),
          n: await bc.bigintToHex(rsa.publicKey.n)
        }
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
    return res.status(200).json({encrypted: bigintToHex(encrypted)});
  } catch(error) {
      console.log("Error: ", error);
      return res.status(500).json({message: "Internal server error"});
  }
}

async function sign(req: Request, res: Response){
  try{
    let msg = req.body.mensaje;
    console.log("MSG: ", msg);
    let encrypted = await rsa.privateKey.sign(hexToBigint(msg));
    return res.status(200).json({dataSigned: bigintToHex(encrypted)});
  } catch (err) {
    return res.status(500).json(err);
  }
}

async function noRepudio(req: Request, res: Response){
  let json = req.body;
  let body = json.body; //Type, src, dst, ts
  //Clave pública cliente
  let aPubKey = new PublicKey(bc.hexToBigint(json.pubKey.e),bc.hexToBigint(json.pubKey.n));
  //Firma cliente (po = proof origin)
  let clientSignature = json.signature;
  //Desciframos firma para obtener el body hasheado (hecho x el cliente)
  let proofDigest = bc.bigintToHex(await aPubKey.verify(bc.hexToBigint(clientSignature)));
  //Hasheamos el body para compararlo
  let bodyDigest = await digest(body);
  //Si son iguales, quiere decir que es legítimo
  console.log("body: ", bodyDigest);
  console.log("proof: ", proofDigest);
  if(bodyDigest.trim() === proofDigest.trim() /* && checkTimestamp(body.timestamp) */) {
      //Preparamos el nuevo mensaje a enviar
      po = clientSignature;
      // c = body.msg; //Mensaje introducido por texto
      let mBody = {
        type: 2, 
        src: 'B', 
        dst: 'A', 
        msg: body.msg,
        timestamp: Date.now()
      };

      //Hasheamos el nuevo body y lo firmamos para obtener el pr (proof reception)
      await digest(mBody).then((data) => {
        let x = keyPair.privateKey.sign(bc.hexToBigint(data))
        pr = bc.bigintToHex(x);
      });

      //Preparamos los nuevos datos con:
      let jsonToSend = {
        body: mBody, //new body
        signature: pr, //firma servidor
        pubKey: { //Clave pública servidor
          e: bc.bigintToHex(keyPair.publicKey.e), 
          n: bc.bigintToHex(keyPair.publicKey.n)
        }
      };

      return res.status(200).send(jsonToSend);
  } else {
      res.status(401).send({error:"Bad authentication"});
  }
}

async function noRepTTP(req: Request, res: Response){
  let pkp, pr, po;
  let data = req.body;
  console.log("data ttp: ", data);
  //Firma del TTP con el body (mensaje type 4)
  let proofDigest = bc.bigintToHex(await pubKeyTTP.verify(bc.hexToBigint(data.signature)));
  let bodyDigest = await sha.digest(data.body);
  if (bodyDigest === proofDigest) {
    /* await decrypt(data.body, data.body.iv)
    console.log("Decrypted message: ", c); */
    console.log("TTP confirmed");
  }
}

async function digest(obj: any) {
  return await sha.digest(obj,'SHA-256');
}

async function sliceSecret (secret:Uint8Array): Promise<Array<string>>{
  console.log('Slicing new secret --> Shares: 5, Threshold: 3');
  let buffers = shamirs.split(secret, { shares: 5, threshold: 3 });
  let slices: Array<string> = [];
  await buffers.forEach((buffer: any) => slices.push(bc.bufToHex(buffer)));
  return slices;
}

async function decrypt(key:Buffer,iv:Buffer){
  const crypto = require("crypto");
  let encryptedText = Buffer.from(c, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', bc.hexToBuf(key), bc.hexToBuf(iv));
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  c = decrypted.toString();
}

export default {getRSA, postRSA, rsaInit, getPublicKeyRSA, postPubKeyRSA, sign, noRepudio, noRepTTP};