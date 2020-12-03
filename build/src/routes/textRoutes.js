"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const text_controller_1 = __importDefault(require("../controllers/text.controller"));
const router = express_1.Router();
router.get('/msg', text_controller_1.default.getText);
router.post('/post', text_controller_1.default.postText);
exports.default = router;
