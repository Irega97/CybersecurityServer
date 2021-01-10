import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';

import Router from './routes/routes';
import rsaController from './controllers/rsa.controller';

//INITIALIZATIONS
const app = express();  //To create an Express application

//CONFIGS
app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({'extended': false}));
app.use(morgan('dev'));
app.use(cors({origin: 'http://localhost:4200'}));
app.use(bodyParser.json());

//ROUTER
app.use('', Router);

//SERVER STARTUP
app.listen(app.get('port'), () => {
    console.log(`Listening at port ${app.get('port')}\n`);
    rsaController.rsaInit(); // GENERA LAS CLAVES AUTOMÁTICAMENTE AL INICIAR EL SERVIDOR
});

export default app;