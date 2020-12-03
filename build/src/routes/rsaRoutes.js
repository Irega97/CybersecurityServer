"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rsa_controller_1 = __importDefault(require("../controllers/rsa.controller"));
const router = express_1.Router();
router.get('/msg', rsa_controller_1.default.getRSA);
router.post('/post', rsa_controller_1.default.postRSA);
exports.default = router;
