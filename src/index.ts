import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';

import Router from './routes/routes';

//INITIALIZATIONS
const serverParams: any = {
    "port": 3000
}
const app:express.Application = express();  //To create an Express application

//CONFIGS
app.set('port', serverParams.port || process.env.PORT);
app.use(express.json());
app.use(express.urlencoded({'extended': false}));
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());

//ROUTER
app.use('', Router);

//SERVER STARTUP
app.listen(app.get('port'), () => {
    console.log(`Listening at port ${app.get('port')}\n`);
});

export default serverParams;