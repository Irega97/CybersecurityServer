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
// HOMOMORFISMO
const paillier = require("paillier-bigint");

let mensaje: string;
let pubKeyClient: PublicKey;
let pubKeyTTP: PublicKey;
let keyPair: any;
let keyPairPaillier: any;
let c: any;
let po: any;
let pr: any;
let pkp: any;
let pko: any;

// Función que se ejecuta al arrancar Backend para obtener las claves necesarias
async function rsaInit(){ //Se ejecuta en index.ts
    console.log("Generando claves . . .")
    // GENERA PAR DE LLAVES RSA (public & private)
    keyPair = await rsa.generateRandomKeys();
    // GENERA PAR DE LLAVES PAILLIER (homomorfismo)
    keyPairPaillier = await paillier.generateRandomKeys();
    console.log("CLAVE PÚBLICA");
    console.log("n: ", keyPair.publicKey.n);
    console.log("CLAVE PÚBLICA PAILLIER");
    console.log("n: ", keyPairPaillier.publicKey.n);
    console.log("Claves generadas con éxito!");
    // Obtiene clave pública del TTP
    getPubKeyTTP();
}

// ******************** RSA ***********************

// Función que envía la clave pública al cliente para cifrar
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

// Función que firma el mensaje que le envía el cliente
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

//************** NO REPUDIO *****************

// Función que obtiene la clave pública del TTP para no repudio
async function getPubKeyTTP(){
  axios.get('http://localhost:3001/ttp/pubkey').then((res: any) => {
    let body = res.data;
    pubKeyTTP = new PublicKey(bc.hexToBigint(body.pubKey.e), bc.hexToBigint(body.pubKey.n));
    console.log("TTP Public Key: {e: ", pubKeyTTP.e, ", n: ", pubKeyTTP.n, "}");
  })
}

// Función que recoge mensaje del cliente con Proof of Origin (PO)
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

// Función que recoge el mensaje del TTP con Proof of Key Publication (PKP)
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

// Función que hashea objeto
async function digest(obj: any) {
  return await sha.digest(obj,'SHA-256');
}

//************ SHARED SECRET *****************

// Creamos servidor para sockets
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

// Conexión de un socket
server.on('connection', async (socket: any) => {
  clientCount++;
  sockets.push(socket);
  console.log("Sockets: ", sockets.length);
  console.log("Nuevo cliente conectado, total: "+clientCount);

  // Confirma la conexión al cliente
  socket.emit('connected',"Conexión con socket establecida!");

  // Cuando hay 5 clientes conectados, se comparte el secreto
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

  // Recibe un trozo de secreto de uno de los clientes
  socket.on('slice', async (slice: any) => {
      sliceCount++;
      console.log("Ha llegado un trozo: ");
      console.log({slice: slice});
      console.log("Hay "+sliceCount+" trozos");
      server.emit('request','Alguien quiere recuperar el secreto');
      clientsSecrets.push(bc.hexToBuf(slice));
      
      // A la que tenemos 3 trozos, lo podemos recuperar
      if(sliceCount==3) {
          totalSecret = await shamirs.combine(clientsSecrets);
          console.log("Ahora podemos recuperar el secreto! Secreto:");
          console.log({secret: bc.bufToHex(totalSecret)});
          server.emit('recovered',bc.bufToHex(totalSecret));
          sliceCount=0;
      }
  });

  // Desconecta un cliente
  socket.on('disconnect', (socket: any) => {
      clientCount--;
      sockets.splice(sockets.indexOf(socket), 1);
      console.log("Sockets: ", sockets.length);
      console.log("Cliente desconectado, total: "+clientCount);
  });
});

// Función que divide el secreto para compartirlo en trozos
async function sliceSecret (secret:Uint8Array): Promise<Array<string>>{
  console.log('Slicing new secret --> Shares: 5, Threshold: 3');
  let buffers = shamirs.split(secret, { shares: 5, threshold: 3 });
  let slices: Array<string> = [];
  await buffers.forEach((buffer: any) => slices.push(bc.bufToHex(buffer)));
  return slices;
}


// ************ HOMOMORFISMO **************

// Función que envía la clave pública de Paillier al cliente para homomorfismo
async function getPaillierPubKey(req: Request, res: Response){
  try {
    keyPairPaillier = await paillier.generateRandomKeys(512);
    res.status(200).send({
      n: bc.bigintToHex(keyPairPaillier["publicKey"]["n"]),
      g: bc.bigintToHex(keyPairPaillier["publicKey"]["g"])
    })
  } catch (err) {
    res.status(500).send({ message: err })
  }
}

// Recoge los votos del cliente
async function postHomomorfismo (req: Request, res: Response){
  try {
      console.log('************************************************');
      const msg = bc.hexToBigint(req.body.totalEncrypted);
      console.log("Votos encriptados: " + msg);
      const decrypt =  await keyPairPaillier["privateKey"].decrypt(msg);
      const votes = ("0000" + decrypt).slice(-5);
      console.log("Votos desencriptado: " + votes);
      var digits = decrypt.toString().split('');
      console.log("digits: " + digits);
      console.log("Votos PP: " + digits[0]);
      console.log("Votos PSOE: " + digits[1]);
      console.log("Votos PODEMOS: " + digits[2]);
      console.log("Votos VOX: " + digits[3]);
      console.log("Votos PACMA: " + digits[4]);
      console.log('************************************************');
      res.status(200).send({ msg: bc.bigintToHex(decrypt) })
  } catch (err) {
      res.status(500).send({ message: err })
      }
};

export default {rsaInit, getPublicKeyRSA, postPubKeyRSA, getRSA, postRSA, sign, noRepudio, noRepTTP, getPaillierPubKey, postHomomorfismo};