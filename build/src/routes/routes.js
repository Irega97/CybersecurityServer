"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const textRoutes_1 = __importDefault(require("./textRoutes"));
const rsaRoutes_1 = __importDefault(require("./rsaRoutes"));
const router = express_1.Router();
router.use('/text', textRoutes_1.default);
router.use('/rsa', rsaRoutes_1.default);
exports.default = router;
