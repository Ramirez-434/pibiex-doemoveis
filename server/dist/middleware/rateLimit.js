"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.registerRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // Limite aumentado para a apresentação do PIBIEX (20 cadastros por IP)
    message: {
        error: 'Muitas tentativas de cadastro a partir deste IP. Por favor, tente novamente após 15 minutos.'
    },
    standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
    legacyHeaders: false, // Desabilita os headers `X-RateLimit-*` legados
});
