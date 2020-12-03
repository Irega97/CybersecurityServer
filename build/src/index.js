"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = __importDefault(require("./routes/routes"));
//INITIALIZATIONS
const serverParams = {
    "port": 3000
};
const app = express_1.default(); //To create an Express application
//CONFIGS
app.set('port', serverParams.port || process.env.PORT);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ 'extended': false }));
app.use(morgan_1.default('dev'));
app.use(cors_1.default());
app.use(body_parser_1.default.json());
//ROUTER
app.use('', routes_1.default);
//SERVER STARTUP
app.listen(app.get('port'), () => {
    console.log(`Listening at port ${app.get('port')}\n`);
});
exports.default = serverParams;
