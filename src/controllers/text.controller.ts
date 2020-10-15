import { Request, Response } from 'express';

import server from '../index'

let mensaje : String;

class TextController {

    public async postText (req:Request, res:Response){
        try{
            console.log('Text sent from Client:', req.body.text);
            mensaje = req.body.text;
            res.status(200).json({"text": req.body.text});
        }
        catch{
            res.status(500).json({"text": 'Internal Server Error'});
        }
    }
    
    public async getText (req:Request, res:Response){
        try{
            console.log('Petición GET realizada');
            res.status(200).json(mensaje);
        }
        catch{
            res.status(500).json({"text": 'Internal Server Error'});
        }
    }
}

const controller: TextController = new TextController();
export default controller;
